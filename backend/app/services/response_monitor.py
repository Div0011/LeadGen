import imaplib
import email
from email.message import Message
import logging
from typing import List, Dict, Optional
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.lead import Lead, LeadStatus

logger = logging.getLogger(__name__)


class ResponseMonitor:
    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or Settings()
        self._email_cache: Dict[str, Lead] = {}

    async def load_lead_emails(self, db: AsyncSession) -> None:
        result = await db.execute(select(Lead).where(Lead.status == LeadStatus.sent))
        leads = result.scalars().all()
        self._email_cache = {lead.email.lower(): lead for lead in leads}
        logger.info(f"Loaded {len(self._email_cache)} lead emails for monitoring")

    def check_inbox(self) -> List[Dict[str, str]]:
        replies = []
        try:
            mail = imaplib.IMAP4_SSL(
                self.settings.IMAP_HOST,
                self.settings.IMAP_PORT,
            )
            mail.login(self.settings.IMAP_USER, self.settings.IMAP_PASSWORD)
            mail.select("inbox")

            status, messages = mail.search(None, "UNSEEN")
            if status != "OK" or not messages[0]:
                mail.logout()
                return replies

            email_ids = messages[0].split()
            for eid in email_ids:
                status, msg_data = mail.fetch(eid, "(RFC822)")
                if status != "OK":
                    continue

                msg = email.message_from_bytes(msg_data[0][1])
                from_addr = self._extract_email_address(msg.get("From", ""))
                subject = msg.get("Subject", "")
                body = self._extract_body(msg)

                if from_addr.lower() in self._email_cache:
                    replies.append(
                        {
                            "from": from_addr,
                            "subject": subject,
                            "body": body,
                            "date": msg.get("Date", ""),
                        }
                    )

            mail.logout()
        except Exception as e:
            logger.error(f"IMAP check failed: {e}")

        return replies

    async def process_replies(
        self, replies: List[Dict[str, str]], db: AsyncSession
    ) -> int:
        processed = 0
        for reply in replies:
            from_email = reply["from"].lower()
            if from_email in self._email_cache:
                lead = self._email_cache[from_email]
                lead.status = LeadStatus.replied
                lead.date_replied = datetime.now(timezone.utc)
                lead.reply_content = reply.get("body", "")[:1000]
                processed += 1
                logger.info(f"Lead {lead.business_name} replied")

        await db.commit()
        return processed

    async def run_monitor_cycle(self, db: AsyncSession) -> int:
        await self.load_lead_emails(db)
        replies = self.check_inbox()
        if replies:
            return await self.process_replies(replies, db)
        return 0

    @staticmethod
    def _extract_email_address(address: str) -> str:
        import re

        match = re.search(r"<([^>]+)>", address)
        return match.group(1) if match else address.strip()

    @staticmethod
    def _extract_body(msg: Message) -> str:
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        return payload.decode("utf-8", errors="ignore")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                return payload.decode("utf-8", errors="ignore")
        return ""
