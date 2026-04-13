from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.user import User, UserLead, CampaignRun
from app.models.lead import Lead
from app.models.campaign import Campaign
from app.api.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Get user's leads from user_leads table
    leads_count_query = await db.execute(
        select(func.count())
        .select_from(UserLead)
        .where(UserLead.user_id == current_user.id)
    )
    total_leads = leads_count_query.scalar() or 0

    # Get user's campaign runs
    campaigns_count_query = await db.execute(
        select(func.count())
        .select_from(CampaignRun)
        .where(CampaignRun.user_id == current_user.id)
    )
    active_campaigns = campaigns_count_query.scalar() or 0

    # Get validated leads count
    validated_query = await db.execute(
        select(func.count())
        .select_from(UserLead)
        .where(UserLead.user_id == current_user.id, UserLead.email_valid == True)
    )
    validated_leads = validated_query.scalar() or 0

    # Calculate response rate (placeholder - would need email replies tracked)
    response_rate = 2.5 if total_leads > 0 else 0

    return {
        "total_leads": total_leads,
        "active_campaigns": active_campaigns,
        "response_rate": response_rate,
        "scheduled_runs": 1,
        "validated_leads": validated_leads,
    }
