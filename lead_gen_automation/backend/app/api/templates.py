from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.email_template import EmailTemplate
from pydantic import BaseModel, Field

router = APIRouter(prefix="/templates", tags=["templates"])


class EmailTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    subject: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1)
    is_active: bool = True


class EmailTemplateUpdate(BaseModel):
    name: str = Field(None, max_length=255)
    subject: str = Field(None, max_length=500)
    body: str = None
    is_active: bool = None


class EmailTemplateResponse(BaseModel):
    id: UUID
    name: str
    subject: str
    body: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[EmailTemplateResponse])
async def get_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> List[EmailTemplate]:
    query = select(EmailTemplate)
    if active_only:
        query = query.where(EmailTemplate.is_active == True)
    query = query.offset(skip).limit(limit).order_by(EmailTemplate.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{template_id}", response_model=EmailTemplateResponse)
async def get_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> EmailTemplate:
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("", response_model=EmailTemplateResponse, status_code=201)
async def create_template(
    template_data: EmailTemplateCreate,
    db: AsyncSession = Depends(get_db),
) -> EmailTemplate:
    existing = await db.execute(
        select(EmailTemplate).where(EmailTemplate.name == template_data.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Template with this name already exists"
        )
    template = EmailTemplate(**template_data.model_dump())
    db.add(template)
    await db.flush()
    await db.refresh(template)
    return template


@router.put("/{template_id}", response_model=EmailTemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: EmailTemplateUpdate,
    db: AsyncSession = Depends(get_db),
) -> EmailTemplate:
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    update_data = template_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)
    await db.flush()
    await db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await db.delete(template)
    await db.flush()
