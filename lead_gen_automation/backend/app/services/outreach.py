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
    ) -> bool:
        personalized = self.personalize_template(
            subject_template,
            body_template,
            company_name,
            contact_person,
        )
        return await self.send_email(
            to_email=to_email,
            subject=personalized["subject"],
            body=personalized["body"],
            pdf_attachment_path=pdf_attachment_path,
        )
