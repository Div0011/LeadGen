import logging
import os
import smtplib
import asyncio
import base64
import httpx
from typing import Optional, Dict
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

from app.core.config import Settings

logger = logging.getLogger(__name__)


class EmailOutreach:
    def __init__(
        self,
        settings: Optional[Settings] = None,
        user_smtp_settings: Optional[Dict] = None,
    ) -> None:
        self.settings = settings or Settings()
        self.base_url = getattr(self.settings, "FRONTEND_URL", "http://localhost:3000")

        # Mailjet settings - check environment variables first, then settings
        self.mailjet_enabled = os.getenv(
            "MAILJET_ENABLED", ""
        ).lower() == "true" or getattr(self.settings, "MAILJET_ENABLED", False)
        self.mailjet_api_key = os.getenv("MAILJET_API_KEY", "") or getattr(
            self.settings, "MAILJET_API_KEY", ""
        )
        self.mailjet_api_secret = os.getenv("MAILJET_API_SECRET", "") or getattr(
            self.settings, "MAILJET_API_SECRET", ""
        )

        # Use user-specific SMTP settings if provided
        if user_smtp_settings:
            self.smtp_host = user_smtp_settings.get(
                "smtp_host", self.settings.SMTP_HOST
            )
            smtp_port_val = user_smtp_settings.get("smtp_port", self.settings.SMTP_PORT)
            smtp_port_int = int(smtp_port_val) if smtp_port_val else 587
            # For port 465 (SMTPS), TLS is implicit, don't use STARTTLS
            # For port 587 (submission), use STARTTLS
            self.smtp_use_tls = (
                user_smtp_settings.get("smtp_use_tls", self.settings.SMTP_USE_TLS)
                if smtp_port_int != 465
                else False
            )
            self.smtp_port = smtp_port_int
            self.smtp_user = user_smtp_settings.get(
                "smtp_user", self.settings.SMTP_USER
            )
            self.smtp_password = user_smtp_settings.get(
                "smtp_password", self.settings.SMTP_PASSWORD
            )
            self.email_from = user_smtp_settings.get(
                "email_from", self.settings.EMAIL_FROM
            )
        else:
            self.smtp_host = self.settings.SMTP_HOST
            self.smtp_port = self.settings.SMTP_PORT
            self.smtp_user = self.settings.SMTP_USER
            self.smtp_password = self.settings.SMTP_PASSWORD
            self.smtp_use_tls = self.settings.SMTP_USE_TLS
            self.email_from = self.settings.EMAIL_FROM

    def personalize_template(
        self,
        subject_template: str,
        body_template: str,
        company_name: str,
        contact_person: Optional[str] = None,
    ) -> Dict[str, str]:
        replacements = {
            "{company_name}": company_name,
            "{contact_person}": contact_person or "there",
        }
        subject = subject_template
        body = body_template
        for placeholder, value in replacements.items():
            subject = subject.replace(placeholder, value)
            body = body.replace(placeholder, value)
        return {"subject": subject, "body": body}

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        pdf_attachment_path: Optional[str] = None,
    ) -> bool:
        # Use Mailjet API if enabled - check both flag and that keys are not empty
        mailjet_ready = (
            bool(self.mailjet_enabled)
            and bool(self.mailjet_api_key)
            and bool(self.mailjet_api_secret)
        )

        logger.info(
            f"send_email check - mailjet_enabled={self.mailjet_enabled}, has_key={bool(self.mailjet_api_key)}, has_secret={bool(self.mailjet_api_secret)}, ready={mailjet_ready}"
        )

        if mailjet_ready:
            return await self._send_via_mailjet(
                to_email=to_email,
                subject=subject,
                body=body,
                html_body=html_body,
                pdf_attachment_path=pdf_attachment_path,
            )

        # Fall back to direct SMTP
        return await self._send_via_smtp(
            to_email=to_email,
            subject=subject,
            body=body,
            html_body=html_body,
            pdf_attachment_path=pdf_attachment_path,
        )

    async def _send_via_mailjet(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        pdf_attachment_path: Optional[str] = None,
    ) -> bool:
        """Send email via Mailjet API"""
        logger.info(
            f"_send_via_mailjet called - to: {to_email}, from: {self.email_from}, api_key: {self.mailjet_api_key[:10] if self.mailjet_api_key else 'None'}..."
        )

        try:
            import json

            messages = [
                {
                    "From": {
                        "Email": self.email_from,
                        "Name": self.settings.AGENCY_NAME or "Lead Gen",
                    },
                    "To": [{"Email": to_email}],
                    "Subject": subject,
                    "TextPart": body,
                }
            ]

            if html_body:
                messages[0]["HTMLPart"] = html_body

            if pdf_attachment_path and os.path.exists(pdf_attachment_path):
                with open(pdf_attachment_path, "rb") as f:
                    pdf_data = base64.b64encode(f.read()).decode()
                messages[0]["Attachments"] = [
                    {
                        "ContentType": "application/pdf",
                        "Filename": os.path.basename(pdf_attachment_path),
                        "Base64Content": pdf_data,
                    }
                ]

            payload = {"Messages": messages}

            auth = (self.mailjet_api_key, self.mailjet_api_secret)

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.mailjet.com/v3.1/send",
                    json=payload,
                    auth=auth,
                    headers={"Content-Type": "application/json"},
                )

                if response.status_code == 200:
                    logger.info(f"Mailjet: Email sent to {to_email}")
                    return True
                else:
                    logger.error(
                        f"Mailjet error: {response.status_code} - {response.text}"
                    )
                    return False

        except Exception as e:
            logger.error(f"Mailjet exception: {e}")
            return False

    async def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        pdf_attachment_path: Optional[str] = None,
    ) -> bool:
        msg = MIMEMultipart("alternative")
        msg["From"] = self.email_from
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))
        if html_body:
            msg.attach(MIMEText(html_body, "html"))

        if pdf_attachment_path and os.path.exists(pdf_attachment_path):
            with open(pdf_attachment_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f'attachment; filename="{os.path.basename(pdf_attachment_path)}"',
                )
                msg.attach(part)

        try:
            smtp_port_int = int(self.smtp_port) if self.smtp_port else 587

            logger.info(f"Connecting to SMTP {self.smtp_host}:{smtp_port_int}")

            if smtp_port_int == 465:
                # Port 465 uses implicit TLS (SMTPS)
                context = smtplib.SMTP_SSL(self.smtp_host, smtp_port_int)
                logger.info("Connected via SMTP_SSL (port 465)")
            else:
                # Port 587 uses STARTTLS
                context = smtplib.SMTP(self.smtp_host, smtp_port_int)
                context.ehlo()
                context.starttls()
                context.ehlo()
                logger.info("Connected via STARTTLS (port 587)")

            if self.smtp_user and self.smtp_password:
                context.login(self.smtp_user, self.smtp_password)
                logger.info("SMTP logged in")

            context.sendmail(msg["From"], msg["To"], msg.as_string())
            context.quit()
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending to {to_email}: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_campaign_email(
        self,
        to_email: str,
        subject_template: str,
        body_template: str,
        company_name: str,
        contact_person: Optional[str] = None,
        pdf_attachment_path: Optional[str] = None,
        lead_id: Optional[str] = None,
        brochure_url: Optional[str] = None,
    ) -> bool:
        personalized = self.personalize_template(
            subject_template,
            body_template,
            company_name,
            contact_person,
        )

        # Create HTML body with tracking pixel and brochure link
        html_body = self._create_html_body(
            personalized["body"], lead_id, brochure_url, company_name
        )

        return await self.send_email(
            to_email=to_email,
            subject=personalized["subject"],
            body=personalized["body"],
            html_body=html_body,
            pdf_attachment_path=pdf_attachment_path,
        )

    def _create_html_body(
        self,
        plain_body: str,
        lead_id: Optional[str],
        brochure_url: Optional[str],
        company_name: str,
    ) -> str:
        # Convert plain text to HTML
        html_body = plain_body.replace("\n", "<br>")

        # Add tracking pixel
        tracking_pixel = ""
        if lead_id:
            tracking_url = f"{self.base_url}/api/tracking/email/{lead_id}"
            tracking_pixel = f'<img src="{tracking_url}" width="1" height="1" style="display:none;" alt="" />'

        # Add brochure link if provided
        brochure_link = ""
        if brochure_url and lead_id:
            tracked_brochure_url = (
                f"{self.base_url}/api/tracking/brochure/{lead_id}?url={brochure_url}"
            )
            brochure_link = f'''
            <div style="margin-top: 20px; padding: 15px; background: #f5f0e8; border-radius: 5px;">
                <p style="margin: 0 0 10px 0; color: #3D2E1E; font-size: 14px;">
                    <strong>Learn more about {company_name}</strong>
                </p>
                <a href="{tracked_brochure_url}" style="color: #8B4A2F; text-decoration: underline;">
                    Click here to view our brochure
                </a>
            </div>
            '''

        # Combine all elements
        full_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #3D2E1E;">
            <div style="max-width: 600px; margin: 0 auto;">
                {html_body}
                {brochure_link}
                {tracking_pixel}
            </div>
        </body>
        </html>
        """

        return full_html
