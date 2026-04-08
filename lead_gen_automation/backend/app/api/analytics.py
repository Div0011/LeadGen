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
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Very basic placeholder logic for total leads and active campaigns
    leads_count_query = await db.execute(select(func.count()).select_from(Lead))
    total_leads = leads_count_query.scalar() or 0

    campaigns_count_query = await db.execute(select(func.count()).select_from(Campaign).where(Campaign.status == 'active'))
    active_campaigns = campaigns_count_query.scalar() or 0

    return {
        "total_leads": total_leads,
        "active_campaigns": active_campaigns,
        "response_rate": 2.5,
        "scheduled_runs": 1
    }
