import logging
import os
from typing import Optional, Dict
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

import aiosmtplib

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

        # Use user-specific SMTP settings if provided
        if user_smtp_settings:
            self.smtp_host = user_smtp_settings.get(
                "smtp_host", self.settings.SMTP_HOST
            )
            self.smtp_port = user_smtp_settings.get(
                "smtp_port", self.settings.SMTP_PORT
            )
            self.smtp_user = user_smtp_settings.get(
                "smtp_user", self.settings.SMTP_USER
            )
            self.smtp_password = user_smtp_settings.get(
                "smtp_password", self.settings.SMTP_PASSWORD
            )
            self.smtp_use_tls = user_smtp_settings.get(
                "smtp_use_tls", self.settings.SMTP_USE_TLS
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
            smtp = aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
            )
            await smtp.connect()

            if self.smtp_use_tls:
                await smtp.starttls()

            if self.smtp_user and self.smtp_password:
                await smtp.login(
                    self.smtp_user,
                    self.smtp_password,
                )
            await smtp.send_message(msg)
            await smtp.quit()
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
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
