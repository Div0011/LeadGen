from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.campaign import Campaign
from app.models.user import CampaignRun
from app.schemas.campaign import CampaignCreate, CampaignResponse
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("", response_model=List[CampaignResponse])
async def get_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List:
    # Get user's campaign runs
    result = await db.execute(
        select(CampaignRun)
        .where(CampaignRun.user_id == current_user.id)
        .order_by(CampaignRun.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    runs = result.scalars().all()

    # Convert to campaign-like format
    campaigns = []
    for run in runs:
        campaigns.append(
            {
                "id": run.id,
                "name": f"{run.agency_type or 'Lead Gen'} - {run.location or 'General'}",
                "target_industry": run.agency_type or "General",
                "target_location": run.location or "N/A",
                "status": run.status,
                "leads_count": run.leads_found or 0,
                "emails_sent": run.leads_validated or 0,
                "replies": run.leads_delivered or 0,
                "created_at": run.created_at,
            }
        )

    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> Campaign:
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    campaign_data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
) -> Campaign:
    existing = await db.execute(
        select(Campaign).where(Campaign.name == campaign_data.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Campaign with this name already exists"
        )
    campaign = Campaign(**campaign_data.model_dump())
    db.add(campaign)
    await db.flush()
    await db.refresh(campaign)
    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: UUID,
    updates: dict,
    db: AsyncSession = Depends(get_db),
) -> Campaign:
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for key, value in updates.items():
        if hasattr(campaign, key):
            setattr(campaign, key, value)
    await db.flush()
    await db.refresh(campaign)
    return campaign


@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(CampaignRun).where(
            CampaignRun.id == campaign_id, CampaignRun.user_id == current_user.id
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await db.delete(campaign)
    await db.commit()
