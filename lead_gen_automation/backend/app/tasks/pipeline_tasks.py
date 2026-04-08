import logging
import os
from typing import Dict, List, Optional
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib
from sqlalchemy import select

from app.tasks import celery_app
from app.services.lead_collector import LeadCollector
from app.services.email_validator import EmailValidator
from app.services.outreach import EmailOutreach
from app.services.response_monitor import ResponseMonitor
from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.models.lead import Lead, LeadStatus

logger = logging.getLogger(__name__)
settings = get_settings()


@celery_app.task(bind=True, name="tasks.run_collection_task")
def run_collection_task(
    self,
    target_industry: str,
    target_location: Optional[str] = None,
    max_leads: int = 50,
) -> Dict[str, any]:
    logger.info(f"Starting collection for {target_industry}")
    collector = LeadCollector(settings)
    leads = collector.collect_leads(target_industry, target_location, max_leads)
    logger.info(f"Collected {len(leads)} leads")
    return {
        "status": "completed",
        "leads_count": len(leads),
        "leads": leads,
    }


@celery_app.task(bind=True, name="tasks.run_validation_task")
def run_validation_task(
    self,
    leads: List[Dict[str, str]],
) -> Dict[str, any]:
    logger.info(f"Validating {len(leads)} leads")
    validator = EmailValidator(settings)
    valid_leads = []
    for lead in leads:
        result = validator.validate_email(lead["email"], use_external=False)
        if result.get("is_valid"):
            valid_leads.append(lead)
    logger.info(f"Validated {len(valid_leads)}/{len(leads)} leads")
    return {
        "status": "completed",
        "valid_leads": valid_leads,
        "valid_count": len(valid_leads),
    }


@celery_app.task(bind=True, name="tasks.run_outreach_task")
def run_outreach_task(
    self,
    leads: List[Dict[str, str]],
    subject_template: str,
    body_template: str,
) -> Dict[str, any]:
    logger.info(f"Sending outreach emails to {len(leads)} leads")
    outreach = EmailOutreach(settings)
    sent = 0
    failed = 0
    for lead in leads:
        try:
            success = outreach.send_campaign_email(
                to_email=lead["email"],
                subject_template=subject_template,
                body_template=body_template,
                company_name=lead.get("business_name", ""),
                contact_person=lead.get("contact_person"),
            )
            if success:
                sent += 1
            else:
                failed += 1
        except Exception as e:
            logger.error(f"Failed to send to {lead['email']}: {e}")
            failed += 1
    logger.info(f"Outreach complete: {sent} sent, {failed} failed")
    return {
        "status": "completed",
        "sent": sent,
        "failed": failed,
    }


@celery_app.task(bind=True, name="tasks.run_full_pipeline_task")
def run_full_pipeline_task(
    self,
    target_industry: str,
    target_location: Optional[str] = None,
    max_leads: int = 50,
    subject_template: str = "Partnership opportunity with {company_name}",
    body_template: str = "Hi {contact_person},\n\nWe'd love to partner with {company_name}.\n\nBest regards",
) -> Dict[str, any]:
    logger.info(f"Starting full pipeline for {target_industry}")

    self.update_state(state="PROGRESS", meta={"stage": "collecting", "progress": 10})
    collection_result = run_collection_task(
        target_industry=target_industry,
        target_location=target_location,
        max_leads=max_leads,
    )
    leads = collection_result.get("leads", [])

    self.update_state(state="PROGRESS", meta={"stage": "validating", "progress": 40})
    validation_result = run_validation_task(leads=leads)
    valid_leads = validation_result.get("valid_leads", [])

    self.update_state(state="PROGRESS", meta={"stage": "sending", "progress": 70})
    outreach_result = run_outreach_task(
        leads=valid_leads,
        subject_template=subject_template,
        body_template=body_template,
    )

    self.update_state(state="PROGRESS", meta={"stage": "completed", "progress": 100})
    logger.info("Full pipeline completed")
    return {
        "status": "completed",
        "leads_collected": collection_result.get("leads_count", 0),
        "leads_validated": validation_result.get("valid_count", 0),
        "emails_sent": outreach_result.get("sent", 0),
        "emails_failed": outreach_result.get("failed", 0),
    }


@celery_app.task(bind=True, name="tasks.run_monitor_task")
def run_monitor_task(self) -> Dict[str, any]:
    logger.info("Starting response monitoring")
    monitor = ResponseMonitor(settings)
    replies = monitor.check_inbox()
    logger.info(f"Found {len(replies)} new replies")
    return {
        "status": "completed",
        "replies_found": len(replies),
        "replies": replies,
    }


@celery_app.task(bind=True, name="tasks.send_daily_report")
def send_daily_report(self) -> Dict[str, any]:
    logger.info("Generating daily lead report")

    import asyncio
    from sqlalchemy import func

    async def get_daily_stats():
        async with AsyncSessionLocal() as db:
            today = datetime.now(timezone.utc).date()
            result = await db.execute(
                select(Lead).where(func.date(Lead.created_at) == today)
            )
            leads = result.scalars().all()

            total_leads = len(leads)
            validated = sum(1 for l in leads if l.status == LeadStatus.validated)
            sent = sum(1 for l in leads if l.status == LeadStatus.sent)
            replied = sum(1 for l in leads if l.status == LeadStatus.replied)

            return {
                "total_generated": total_leads,
                "validated": validated,
                "sent": sent,
                "replied": replied,
                "conversion_rate": round((replied / sent * 100) if sent > 0 else 0, 2),
            }

    stats = asyncio.run(get_daily_stats())

    report_html = f"""
    <html>
    <body>
        <h2>Daily Lead Generation Report</h2>
        <p>Date: {datetime.now().strftime("%Y-%m-%d")}</p>
        <table>
            <tr><td>Total Leads Generated:</td><td>{stats["total_generated"]}</td></tr>
            <tr><td>Validated:</td><td>{stats["validated"]}</td></tr>
            <tr><td>Emails Sent:</td><td>{stats["sent"]}</td></tr>
            <tr><td>Replies Received:</td><td>{stats["replied"]}</td></tr>
            <tr><td>Conversion Rate:</td><td>{stats["conversion_rate"]}%</td></tr>
        </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = settings.AGENCY_EMAIL
    msg["Subject"] = f"Daily Lead Report - {datetime.now().strftime('%Y-%m-%d')}"
    msg.attach(MIMEText(report_html, "html"))

    try:
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            import asyncpg

            asyncio.run(
                aiosmtplib.send(
                    msg,
                    hostname=settings.SMTP_HOST,
                    port=settings.SMTP_PORT,
                    username=settings.SMTP_USER,
                    password=settings.SMTP_PASSWORD,
                )
            )
            logger.info("Daily report sent successfully")
    except Exception as e:
        logger.error(f"Failed to send daily report: {e}")

    return {
        "status": "completed",
        "stats": stats,
    }


@celery_app.task(bind=True, name="tasks.process_pending_brochures")
def process_pending_brochures(self) -> Dict[str, any]:
    logger.info("Processing pending brochure sends")

    import asyncio

    async def send_pending_brochures():
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Lead)
                .where(Lead.status == LeadStatus.validated, Lead.brochure_sent == False)
                .limit(10)
            )
            leads = result.scalars().all()

            brochure_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "data",
                "brochure.pdf",
            )
            if not os.path.exists(brochure_path):
                logger.warning("Brochure file not found")
                return {"sent": 0, "failed": 0}

            outreach = EmailOutreach(settings)
            sent = 0
            failed = 0

            for lead in leads:
                try:
                    success = asyncio.run(
                        outreach.send_email(
                            to_email=lead.email,
                            subject=f"Company Brochure for {lead.business_name}",
                            body=f"Dear {lead.contact_person or 'Contact'},\\n\\nPlease find attached our company brochure.\\n\\nBest regards",
                            pdf_attachment_path=brochure_path,
                        )
                    )
                    if success:
                        lead.brochure_sent = True
                        lead.date_brochure_sent = datetime.now(timezone.utc)
                        sent += 1
                    else:
                        failed += 1
                except Exception as e:
                    logger.error(f"Failed to send brochure to {lead.email}: {e}")
                    failed += 1

            await db.commit()
            return {"sent": sent, "failed": failed}

    result = asyncio.run(send_pending_brochures())
    logger.info(f"Brochure processing complete: {result}")
    return {
        "status": "completed",
        "sent": result["sent"],
        "failed": result["failed"],
    }
