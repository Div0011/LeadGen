from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.lead import Lead, LeadStatus
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadFilter

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=List[LeadResponse])
async def get_leads(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> List[Lead]:
    query = select(Lead)
    if status:
        query = query.where(Lead.status == LeadStatus(status))
    if source:
        query = query.where(Lead.source == source)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Lead.business_name.ilike(search_pattern),
                Lead.email.ilike(search_pattern),
                Lead.contact_person.ilike(search_pattern),
            )
        )
    query = query.offset(skip).limit(limit).order_by(Lead.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/stats")
async def get_lead_stats(db: AsyncSession = Depends(get_db)) -> dict:
    total_result = await db.execute(select(func.count(Lead.id)))
    total = total_result.scalar() or 0
    status_counts = {}
    for status in LeadStatus:
        result = await db.execute(
            select(func.count(Lead.id)).where(Lead.status == status)
        )
        status_counts[status.value] = result.scalar() or 0
    return {
        "total_leads": total,
        "by_status": status_counts,
    }


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: UUID, db: AsyncSession = Depends(get_db)) -> Lead:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(
    lead_data: LeadCreate,
    db: AsyncSession = Depends(get_db),
) -> Lead:
    existing = await db.execute(select(Lead).where(Lead.email == lead_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Lead with this email already exists"
        )
    lead = Lead(**lead_data.model_dump())
    db.add(lead)
    await db.flush()
    await db.refresh(lead)
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    lead_data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
) -> Lead:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    update_data = lead_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)
    await db.flush()
    await db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(lead_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)
    await db.flush()
