from typing import Optional
from datetime import datetime, timezone, timedelta
from uuid import UUID
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.lead import Lead, LeadStatus
from app.models.user import User
from app.api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.get("/email/{lead_id}")
async def track_email_open(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Track when a recipient opens an email (1x1 pixel tracking)"""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()

    if not lead:
        logger.warning(f"Lead not found for tracking: {lead_id}")
        return None

    if not lead.email_opened:
        lead.email_opened = True
        lead.email_opened_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(f"Email opened tracked for lead: {lead.email}")

    pixel = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde"
        b"\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01"
        b"\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    from fastapi.responses import Response

    return Response(content=pixel, media_type="image/png")


@router.get("/brochure/{lead_id}")
async def track_brochure_click(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Track when a recipient clicks the brochure link"""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()

    if not lead:
        logger.warning(f"Lead not found for brochure tracking: {lead_id}")
        raise HTTPException(status_code=404, detail="Lead not found")

    if not lead.brochure_clicked:
        lead.brochure_clicked = True
        lead.brochure_clicked_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(f"Brochure click tracked for lead: {lead.email}")

    from fastapi.responses import RedirectResponse

    if lead.website:
        return RedirectResponse(url=lead.website, status_code=302)
    return {"message": "Brochure tracked successfully"}


@router.get("/leads/pending-followup")
async def get_leads_pending_followup(
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get leads that have been sent emails but haven't opened them within specified hours"""
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)

    query = (
        select(Lead)
        .where(
            and_(
                Lead.status == LeadStatus.sent,
                Lead.email_opened == False,
                Lead.date_sent <= cutoff_time,
                Lead.follow_up_count < 3,
            )
        )
        .order_by(Lead.date_sent.asc())
    )

    result = await db.execute(query)
    leads = result.scalars().all()

    return {
        "count": len(leads),
        "leads": [
            {
                "id": lead.id,
                "business_name": lead.business_name,
                "email": lead.email,
                "date_sent": lead.date_sent.isoformat() if lead.date_sent else None,
                "follow_up_count": lead.follow_up_count,
                "hours_pending": int(
                    (datetime.now(timezone.utc) - lead.date_sent).total_seconds() / 3600
                )
                if lead.date_sent
                else 0,
            }
            for lead in leads
        ],
    }


@router.get("/leads/tracking-stats")
async def get_tracking_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get email tracking statistics"""
    result = await db.execute(select(Lead))
    all_leads = result.scalars().all()

    total_sent = sum(1 for lead in all_leads if lead.status == LeadStatus.sent)
    total_opened = sum(1 for lead in all_leads if lead.email_opened)
    total_brochure_clicked = sum(1 for lead in all_leads if lead.brochure_clicked)
    total_replied = sum(1 for lead in all_leads if lead.status == LeadStatus.replied)
    total_follow_ups_sent = sum(lead.follow_up_count for lead in all_leads)

    return {
        "total_emails_sent": total_sent,
        "total_emails_opened": total_opened,
        "open_rate": round((total_opened / total_sent * 100), 2)
        if total_sent > 0
        else 0,
        "total_brochure_clicks": total_brochure_clicked,
        "brochure_click_rate": round((total_brochure_clicked / total_sent * 100), 2)
        if total_sent > 0
        else 0,
        "total_replies": total_replied,
        "reply_rate": round((total_replied / total_sent * 100), 2)
        if total_sent > 0
        else 0,
        "total_follow_ups_sent": total_follow_ups_sent,
    }


@router.post("/leads/{lead_id}/send-followup")
async def send_followup_email(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger a follow-up email for a lead"""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.follow_up_count >= 3:
        raise HTTPException(
            status_code=400, detail="Maximum follow-up attempts reached"
        )

    from app.services.outreach import EmailOutreach
    from app.core.config import Settings

    settings = Settings()
    user_smtp_settings = None
    if current_user.smtp_username and current_user.smtp_password:
        user_smtp_settings = {
            "smtp_host": current_user.smtp_host or "smtp.gmail.com",
            "smtp_port": int(current_user.smtp_port) if current_user.smtp_port else 587,
            "smtp_user": current_user.smtp_username,
            "smtp_password": current_user.smtp_password,
            "smtp_use_tls": current_user.smtp_use_tls
            if current_user.smtp_use_tls is not None
            else True,
            "email_from": current_user.smtp_username,
        }

    outreach = EmailOutreach(settings, user_smtp_settings)

    follow_up_subjects = [
        "Following up on my previous email",
        "Just checking in",
        "Would love to connect",
    ]

    follow_up_bodies = [
        f"Hi {lead.contact_person or 'there'},\n\nI wanted to follow up on my previous email regarding {lead.business_name}. I understand you might be busy, but I'd love to discuss how we could help.\n\nBest regards",
        f"Hi {lead.contact_person or 'there'},\n\nJust wanted to check if you had a chance to review my earlier message. I'm happy to answer any questions you might have.\n\nBest regards",
        f"Hi {lead.contact_person or 'there'},\n\nI hope this email finds you well. I wanted to reach out again to see if you'd be interested in a quick call to explore how we could support {lead.business_name}.\n\nBest regards",
    ]

    subject = follow_up_subjects[min(lead.follow_up_count, len(follow_up_subjects) - 1)]
    body = follow_up_bodies[min(lead.follow_up_count, len(follow_up_bodies) - 1)]

    success = await outreach.send_campaign_email(
        to_email=lead.email,
        subject_template=subject,
        body_template=body,
        company_name=lead.business_name,
        contact_person=lead.contact_person,
    )

    if success:
        lead.follow_up_sent = True
        lead.follow_up_count += 1
        lead.last_follow_up_sent_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(
            f"Follow-up email sent to {lead.email} (attempt {lead.follow_up_count})"
        )
        return {
            "success": True,
            "message": f"Follow-up email sent (attempt {lead.follow_up_count})",
        }

    raise HTTPException(status_code=500, detail="Failed to send follow-up email")


@router.post("/campaigns/{campaign_id}/schedule-followups")
async def schedule_followups_for_campaign(
    campaign_id: str,
    hours_after: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Schedule automatic follow-ups for all leads in a campaign that haven't opened emails"""
    from app.models.campaign import Campaign

    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = await db.execute(
        select(Lead).where(
            and_(
                Lead.status == LeadStatus.sent,
                Lead.email_opened == False,
                Lead.follow_up_count < 3,
            )
        )
    )
    leads = result.scalars().all()

    scheduled_count = 0
    for lead in leads:
        if lead.follow_up_scheduled_at is None:
            lead.follow_up_scheduled_at = datetime.now(timezone.utc) + timedelta(
                hours=hours_after
            )
            scheduled_count += 1

    await db.commit()

    return {
        "success": True,
        "message": f"Scheduled {scheduled_count} follow-ups",
        "hours_after": hours_after,
    }
