import logging
from typing import Dict, List, Optional
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.lead import Lead, LeadStatus
from app.models.campaign import Campaign
from app.models.email_template import EmailTemplate
from app.services.lead_collector import LeadCollector
from app.services.email_validator import EmailValidator
from app.services.outreach import EmailOutreach

logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    def __init__(
        self,
        db: AsyncSession,
        settings: Optional[Settings] = None,
        user_smtp_settings: Optional[Dict] = None,
    ) -> None:
        self.db = db
        self.settings = settings or Settings()

        # Override SMTP settings with user-specific settings if provided
        if user_smtp_settings:
            self.user_smtp_settings = user_smtp_settings
        else:
            self.user_smtp_settings = None

        self.collector = LeadCollector(self.settings)
        self.validator = EmailValidator(self.settings)
        self.outreach = EmailOutreach(self.settings, user_smtp_settings)
        self.progress: Dict[str, any] = {
            "stage": "idle",
            "progress": 0.0,
            "leads_collected": 0,
            "leads_validated": 0,
            "emails_sent": 0,
            "errors": [],
            "is_running": False,
        }

    async def run_full_pipeline(
        self,
        target_industry: str,
        target_location: Optional[str] = None,
        max_leads: int = 50,
        campaign_id: Optional[str] = None,
        template_id: Optional[str] = None,
        send_emails: bool = True,
    ) -> Dict[str, any]:
        self.progress["is_running"] = True
        self.progress["errors"] = []

        try:
            self.progress["stage"] = "collecting"
            self.progress["progress"] = 10.0
            leads = await self._collect_leads(
                target_industry, target_location, max_leads
            )

            self.progress["stage"] = "validating"
            self.progress["progress"] = 40.0
            valid_leads = await self._validate_leads(leads)

            self.progress["stage"] = "saving"
            self.progress["progress"] = 60.0
            saved_leads = await self._save_leads(valid_leads, campaign_id)

            if send_emails and saved_leads:
                self.progress["stage"] = "sending"
                self.progress["progress"] = 75.0
                await self._send_emails(saved_leads, template_id)

            self.progress["stage"] = "completed"
            self.progress["progress"] = 100.0
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            self.progress["errors"].append(str(e))
            self.progress["stage"] = "failed"
        finally:
            self.progress["is_running"] = False

        return self.progress

    async def _collect_leads(
        self,
        target_industry: str,
        target_location: Optional[str],
        max_leads: int,
    ) -> List[Dict[str, str]]:
        logger.info(f"Collecting leads for {target_industry}")
        leads = self.collector.collect_leads(
            target_industry, target_location, max_leads
        )
        self.progress["leads_collected"] = len(leads)
        return leads

    async def _validate_leads(
        self,
        leads: List[Dict[str, str]],
    ) -> List[Dict[str, str]]:
        valid_leads = []
        for i, lead in enumerate(leads):
            validation = await self.validator.validate_email(
                lead["email"], use_external=False
            )
            if validation.get("is_valid"):
                valid_leads.append(lead)
            self.progress["leads_validated"] = i + 1
        logger.info(f"Validated {len(valid_leads)}/{len(leads)} leads")
        return valid_leads

    async def _save_leads(
        self,
        leads: List[Dict[str, str]],
        campaign_id: Optional[str],
    ) -> List[Lead]:
        saved = []
        for lead_data in leads:
            existing = await self.db.execute(
                select(Lead).where(Lead.email == lead_data["email"])
            )
            existing_lead = existing.scalar_one_or_none()
            if existing_lead:
                saved.append(existing_lead)
                continue

            lead = Lead(
                business_name=lead_data["business_name"],
                website=lead_data.get("website"),
                contact_person=lead_data.get("contact_person"),
                email=lead_data["email"],
                linkedin=lead_data.get("linkedin"),
                status=LeadStatus.validated,
                source=lead_data.get("source", "pipeline"),
            )
            self.db.add(lead)
            saved.append(lead)

        await self.db.commit()

        if campaign_id:
            result = await self.db.execute(
                select(Campaign).where(Campaign.id == campaign_id)
            )
            campaign = result.scalar_one_or_none()
            if campaign:
                campaign.leads_count += len(saved)
                await self.db.commit()

        logger.info(f"Saved {len(saved)} leads to database")
        return saved

    async def _send_emails(
        self,
        leads: List[Lead],
        template_id: Optional[str],
    ) -> int:
        if template_id:
            result = await self.db.execute(
                select(EmailTemplate).where(EmailTemplate.id == template_id)
            )
            template = result.scalar_one_or_none()
        else:
            result = await self.db.execute(
                select(EmailTemplate).where(EmailTemplate.is_active == True)
            )
            template = result.scalars().first()

        if not template:
            self.progress["errors"].append("No email template found")
            return 0

        sent_count = 0
        for lead in leads:
            if lead.status != LeadStatus.validated:
                continue

            # Get brochure URL from template if available
            brochure_url = getattr(template, "brochure_url", None) if template else None

            success = await self.outreach.send_campaign_email(
                to_email=lead.email,
                subject_template=template.subject,
                body_template=template.body,
                company_name=lead.business_name,
                contact_person=lead.contact_person,
                lead_id=lead.id,
                brochure_url=brochure_url,
            )

            if success:
                lead.status = LeadStatus.sent
                lead.date_sent = datetime.now(timezone.utc)
                sent_count += 1
            else:
                lead.status = LeadStatus.bounced

            self.progress["emails_sent"] = sent_count

        await db.commit()
        logger.info(f"Sent {sent_count} emails")
        return sent_count

    def get_progress(self) -> Dict[str, any]:
        return self.progress.copy()
