from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.lead import Lead, LeadStatus
from app.models.user import UserLead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadFilter
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("")
async def get_leads(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    campaign_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List:
    # Get leads from user_leads table for current user
    query = select(UserLead).where(UserLead.user_id == current_user.id)

    if campaign_id:
        query = query.where(UserLead.campaign_id == campaign_id)
    if status:
        query = query.where(UserLead.status == status)
    if source:
        query = query.where(UserLead.source == source)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                UserLead.business_name.ilike(search_pattern),
                UserLead.email.ilike(search_pattern),
                UserLead.contact_name.ilike(search_pattern),
            )
        )
    query = query.offset(skip).limit(limit).order_by(UserLead.created_at.desc())
    result = await db.execute(query)
    leads = result.scalars().all()

    # Convert to Lead-like response
    return [
        {
            "id": lead.id,
            "business_name": lead.business_name,
            "website": lead.website,
            "email": lead.email,
            "phone": lead.phone,
            "contact_person": lead.contact_name,
            "source": str(lead.source) if lead.source else "manual",
            "status": str(lead.status) if lead.status else "new",
            "email_valid": bool(lead.email_valid)
            if lead.email_valid is not None
            else False,
            "email_validation_status": "valid" if lead.email_valid else None,
            "created_at": str(lead.created_at) if lead.created_at else None,
            "campaign_id": lead.campaign_id,
            "email_opened": getattr(lead, "email_opened", False) or False,
            "follow_up_sent": getattr(lead, "follow_up_sent", False) or False,
        }
        for lead in leads
    ]


@router.get("/stats")
async def get_lead_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    # Get user's leads from user_leads table
    total_result = await db.execute(
        select(func.count(UserLead.id)).where(UserLead.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    # Count by status
    status_result = await db.execute(
        select(UserLead.status, func.count(UserLead.id))
        .where(UserLead.user_id == current_user.id)
        .group_by(UserLead.status)
    )
    status_counts = {row[0]: row[1] for row in status_result.fetchall()}

    return {
        "total_leads": total,
        "by_status": status_counts,
    }


@router.get("/{lead_id}")
async def get_lead(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(
        select(UserLead).where(
            UserLead.id == lead_id, UserLead.user_id == current_user.id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {
        "id": lead.id,
        "business_name": lead.business_name,
        "website": lead.website,
        "email": lead.email,
        "phone": lead.phone,
        "contact_person": lead.contact_name,
        "source": lead.source or "manual",
        "status": lead.status,
        "email_valid": lead.email_valid,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
    }


@router.post("", status_code=201)
async def create_lead(
    lead_data: LeadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    lead = UserLead(
        user_id=current_user.id,
        business_name=lead_data.business_name,
        website=lead_data.website,
        email=lead_data.email,
        phone=lead_data.phone,
        contact_name=lead_data.contact_person,
        source="manual",
        status="new",
    )
    db.add(lead)
    await db.flush()
    await db.refresh(lead)
    return {
        "id": lead.id,
        "business_name": lead.business_name,
        "website": lead.website,
        "email": lead.email,
        "phone": lead.phone,
        "contact_person": lead.contact_name,
        "source": lead.source,
        "status": lead.status,
        "created_at": lead.created_at,
    }


@router.post("/{lead_id}/send")
async def send_lead_email(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Send email to a lead"""
    result = await db.execute(
        select(UserLead).where(
            UserLead.id == lead_id, UserLead.user_id == current_user.id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.status in ["sent", "replied"]:
        raise HTTPException(status_code=400, detail="Email already sent or replied to")

    # Check if user has SMTP settings
    if not current_user.smtp_username or not current_user.smtp_password:
        raise HTTPException(
            status_code=400,
            detail="SMTP not configured. Please add SMTP settings first.",
        )

    # Send email using Outreach service
    try:
        from app.services.outreach import EmailOutreach
        from datetime import datetime, timezone
        import logging

        logger = logging.getLogger(__name__)

        # Validate lead has email
        if not lead.email:
            raise HTTPException(
                status_code=400, detail="Lead does not have an email address"
            )

        logger.info(f"Sending email to {lead.email} via {current_user.smtp_username}")

        smtp_settings = {
            "smtp_host": current_user.smtp_host or "smtp.gmail.com",
            "smtp_port": int(current_user.smtp_port or 587),
            "smtp_user": current_user.smtp_username,
            "smtp_password": current_user.smtp_password,
            "smtp_use_tls": current_user.smtp_use_tls or True,
            "email_from": current_user.smtp_username,
        }

        outreach = EmailOutreach(user_smtp_settings=smtp_settings)

        sender_name = current_user.name or "The LeadGen Team"
        contact_person_name = lead.contact_name or "there"

        # Generate auto outreach content with greeting + company intro
        # Use company_intro_for_email for email content (NOT target_industry which is for lead hunting)
        company_intro = (
            current_user.company_intro_for_email
            or current_user.company_description
            or "We specialize in helping businesses like yours grow through targeted outreach."
        )

        subject_template = f"Introduction from {sender_name}"

        body_template = f"""Hi {contact_person_name},

{sender_name} from {current_user.company_name or "our company"} here.

{company_intro}

I've researched {lead.business_name} and believe we could add value to your operations. Would love to explore if there's a fit.

Looking forward to hearing from you!

Best regards,
{sender_name}"""

        success = await outreach.send_campaign_email(
            to_email=lead.email,
            subject_template=subject_template,
            body_template=body_template,
            company_name=lead.business_name,
            contact_person=lead.contact_name or None,
            lead_id=lead.id,
            pdf_attachment_path=current_user.brochure_path,
        )

        logger.info(f"Email send result: success={success}")

        if not success:
            raise Exception("Failed to send email via outreach service")

        # Update lead status and date
        lead.status = "sent"
        lead.delivered_at = datetime.now(timezone.utc)
        await db.commit()

        return {"success": True, "message": f"Email sent to {lead.email}"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


@router.post("/{lead_id}/follow-up")
async def send_follow_up_email(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Send follow-up email to a lead if no response received"""
    result = await db.execute(
        select(UserLead).where(
            UserLead.id == lead_id, UserLead.user_id == current_user.id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.status not in ["sent"]:
        raise HTTPException(status_code=400, detail="Lead must have initial email sent")

    if lead.follow_up_sent:
        raise HTTPException(status_code=400, detail="Follow-up already sent")

    if lead.reply_received:
        raise HTTPException(status_code=400, detail="Lead already replied")

    if not current_user.smtp_username or not current_user.smtp_password:
        raise HTTPException(
            status_code=400,
            detail="SMTP not configured. Please add SMTP settings first.",
        )

    try:
        from app.services.outreach import EmailOutreach
        from datetime import datetime, timezone
        import logging

        logger = logging.getLogger(__name__)

        if not lead.email:
            raise HTTPException(
                status_code=400, detail="Lead does not have an email address"
            )

        logger.info(f"Sending follow-up email to {lead.email}")

        smtp_settings = {
            "smtp_host": current_user.smtp_host or "smtp.gmail.com",
            "smtp_port": int(current_user.smtp_port or 587),
            "smtp_user": current_user.smtp_username,
            "smtp_password": current_user.smtp_password,
            "smtp_use_tls": current_user.smtp_use_tls or True,
            "email_from": current_user.smtp_username,
        }

        outreach = EmailOutreach(user_smtp_settings=smtp_settings)

        sender_name = current_user.name or "The LeadGen Team"
        contact_person_name = lead.contact_name or "there"

        subject_template = f"Following up - {sender_name}"

        body_template = f"""Hi {contact_person_name},

{sender_name} here from {current_user.company_name or "our company"}.

Just wanted to follow up on my earlier email. I haven't heard back and completely understand you might be busy.

Would love to connect briefly if there's interest. No pressure at all.

Best regards,
{sender_name}"""

        success = await outreach.send_campaign_email(
            to_email=lead.email,
            subject_template=subject_template,
            body_template=body_template,
            company_name=lead.business_name,
            contact_person=lead.contact_name or None,
            lead_id=lead.id,
            pdf_attachment_path=current_user.brochure_path,
        )

        if not success:
            raise Exception("Failed to send follow-up email")

        # Update lead with follow-up status
        lead.follow_up_sent = True
        lead.follow_up_sent_at = datetime.now(timezone.utc)
        await db.commit()

        return {"success": True, "message": f"Follow-up sent to {lead.email}"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send follow-up email: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to send follow-up email: {str(e)}"
        )


@router.put("/{lead_id}")
async def update_lead(
    lead_id: str,
    lead_data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(
        select(UserLead).where(
            UserLead.id == lead_id, UserLead.user_id == current_user.id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(lead, key):
            setattr(lead, key, value)

    await db.flush()
    await db.refresh(lead)
    return {
        "id": lead.id,
        "business_name": lead.business_name,
        "status": lead.status,
    }


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(UserLead).where(
            UserLead.id == lead_id, UserLead.user_id == current_user.id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)
    await db.flush()
