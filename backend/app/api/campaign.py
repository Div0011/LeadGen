from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import get_settings
from app.models.user import User
from app.api.auth import get_current_user
from app.services.user_leads import run_user_campaign

router = APIRouter(prefix="/campaign", tags=["campaign"])


@router.post("/run")
async def run_campaign(
    agency_type: str = Query("web_development"),
    location: str = Query("India"),
    max_leads: int = Query(50, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run lead generation campaign and deliver to user's email"""
    settings = get_settings()

    result = await run_user_campaign(
        user_id=user.id,
        agency_type=agency_type,
        location=location,
        max_leads=max_leads,
        db=db,
        settings=settings,
    )

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "status": "success",
        "message": f"Generated {result['leads_generated']} leads, delivered {result['leads_delivered']} to {user.email}",
        "leads_generated": result["leads_generated"],
        "leads_delivered": result["leads_delivered"],
    }


@router.get("/status")
async def get_campaign_status(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get campaign status"""
    from sqlalchemy import select, func
    from app.models.user import CampaignRun

    result = await db.execute(
        select(func.count(CampaignRun.id)).where(CampaignRun.user_id == user.id)
    )
    total_runs = result.scalar() or 0

    return {
        "total_campaigns": total_runs,
        "quota": user.lead_quota,
        "leads_used": user.leads_used,
        "leads_remaining": user.lead_quota - user.leads_used,
    }
