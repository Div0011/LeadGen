from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.core.database import get_db
from app.models.user import User, UserLead, CampaignRun
from app.core.config import get_settings
import secrets

router = APIRouter(prefix="/auth", tags=["authentication"])


# Pydantic Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    company_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    agency_type: Optional[str] = None
    agency_url: Optional[str] = None
    services: Optional[str] = None
    target_industry: Optional[str] = None
    target_location: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    company_name: Optional[str]
    agency_type: Optional[str]
    agency_url: Optional[str]
    services: Optional[str]
    target_industry: Optional[str]
    target_location: Optional[str]
    is_active: bool
    lead_quota: int
    leads_used: int
    created_at: datetime


class LeadResponse(BaseModel):
    id: str
    business_name: str
    website: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    contact_name: Optional[str]
    industry: Optional[str]
    location: Optional[str]
    is_redesign_needed: bool
    email_valid: bool
    status: str
    delivered: bool


async def get_current_user(
    authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from API key"""
    if not authorization or not authorization.startswith("ApiKey "):
        raise HTTPException(status_code=401, detail="Missing or invalid API key")

    api_key = authorization.replace("ApiKey ", "")
    result = await db.execute(select(User).where(User.api_key == api_key))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return user


@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=request.email,
        name=request.name or "",
        company_name=request.company_name or "",
    )
    user.set_password(request.password)
    user.generate_api_key()

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        company_name=user.company_name,
        agency_type=user.agency_type if hasattr(user, "agency_type") else None,
        agency_url=user.agency_url if hasattr(user, "agency_url") else None,
        services=user.services,
        target_industry=user.target_industry,
        target_location=user.target_location,
        is_active=user.is_active,
        lead_quota=user.lead_quota,
        leads_used=user.leads_used,
        created_at=user.created_at,
    )


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login and get API key"""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not user.check_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    return {
        "api_key": user.api_key,
        "email": user.email,
        "name": user.name,
        "message": "Login successful",
    }


@router.get("/profile", response_model=UserResponse)
async def get_profile(user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        company_name=user.company_name,
        agency_type=user.agency_type,
        agency_url=user.agency_url,
        services=user.services,
        target_industry=user.target_industry,
        target_location=user.target_location,
        is_active=user.is_active,
        lead_quota=user.lead_quota,
        leads_used=user.leads_used,
        created_at=user.created_at,
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile"""
    if request.name is not None:
        user.name = request.name
    if request.company_name is not None:
        user.company_name = request.company_name
    if request.agency_type is not None:
        user.agency_type = request.agency_type
    if request.agency_url is not None:
        user.agency_url = request.agency_url
    if request.services is not None:
        user.services = request.services
    if request.target_industry is not None:
        user.target_industry = request.target_industry
    if request.target_location is not None:
        user.target_location = request.target_location

    await db.commit()
    await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        company_name=user.company_name,
        agency_type=user.agency_type,
        agency_url=user.agency_url,
        services=user.services,
        target_industry=user.target_industry,
        target_location=user.target_location,
        is_active=user.is_active,
        lead_quota=user.lead_quota,
        leads_used=user.leads_used,
        created_at=user.created_at,
    )


@router.get("/leads", response_model=list[LeadResponse])
async def get_leads(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's leads"""
    query = (
        select(UserLead)
        .where(UserLead.user_id == user.id)
        .order_by(UserLead.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    leads = result.scalars().all()

    return [
        LeadResponse(
            id=lead.id,
            business_name=lead.business_name,
            website=lead.website,
            email=lead.email,
            phone=lead.phone,
            contact_name=lead.contact_name,
            industry=lead.industry,
            location=lead.location,
            is_redesign_needed=lead.is_redesign_needed,
            email_valid=lead.email_valid,
            status=lead.status,
            delivered=lead.delivered,
        )
        for lead in leads
    ]


@router.get("/stats")
async def get_user_stats(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get user statistics"""
    # Total leads
    total_result = await db.execute(
        select(func.count(UserLead.id)).where(UserLead.user_id == user.id)
    )
    total_leads = total_result.scalar() or 0

    # Delivered leads
    delivered_result = await db.execute(
        select(func.count(UserLead.id)).where(
            UserLead.user_id == user.id, UserLead.delivered == True
        )
    )
    delivered = delivered_result.scalar() or 0

    # Redesign needed
    redesign_result = await db.execute(
        select(func.count(UserLead.id)).where(
            UserLead.user_id == user.id, UserLead.is_redesign_needed == True
        )
    )
    redesign_needed = redesign_result.scalar() or 0

    return {
        "total_leads": total_leads,
        "leads_used": user.leads_used,
        "leads_remaining": user.lead_quota - user.leads_used,
        "delivered": delivered,
        "redesign_needed": redesign_needed,
        "quota": user.lead_quota,
    }


@router.post("/regenerate-key")
async def regenerate_api_key(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Regenerate API key"""
    new_key = user.generate_api_key()
    await db.commit()
    return {"api_key": new_key, "message": "API key regenerated"}
