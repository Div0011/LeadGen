from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
from pathlib import Path

from app.core.database import get_db
from app.models.agency import AgencyProfile, TargetLead
from app.models.lead import LeadStatus
from app.schemas.lead import LeadCreate, LeadResponse
from app.services.agency_discovery import AgencyLeadDiscovery
from app.services.agency_pipeline import AgencyPipeline, AgencyEmailValidator
from app.services.lead_collector import LeadCollector

router = APIRouter(prefix="/agency", tags=["agency"])


@router.get("/types")
async def get_agency_types():
    """Get available agency types"""
    discovery = LeadCollector()
    return {
        "agency_types": {
            "web_development": "Web Development Agency",
            "ecommerce": "E-commerce Development",
            "mobile_app": "Mobile App Development",
            "seo": "SEO & Digital Marketing",
            "video_production": "Video Production",
        },
        "search_queries": AgencyLeadDiscovery.AGENCY_TYPES,
    }


@router.post("/profile")
async def create_agency_profile(
    name: str,
    website_url: str,
    agency_type: str,
    description: str = "",
    services_offered: str = "",
    target_industry: str = "",
    target_location: str = "India",
    db: AsyncSession = Depends(get_db),
):
    """Create a new agency profile"""
    existing = await db.execute(
        select(AgencyProfile).where(AgencyProfile.website_url == website_url)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Agency with this URL already exists"
        )

    profile = AgencyProfile(
        name=name,
        website_url=website_url,
        agency_type=agency_type,
        description=description,
        services_offered=services_offered,
        target_industry=target_industry,
        target_location=target_location,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    return {
        "id": profile.id,
        "name": profile.name,
        "website_url": profile.website_url,
        "agency_type": profile.agency_type,
        "status": "created",
    }


@router.get("/profile")
async def get_agency_profile(db: AsyncSession = Depends(get_db)):
    """Get the agency profile"""
    result = await db.execute(select(AgencyProfile))
    profiles = result.scalars().all()

    if not profiles:
        return {"status": "no_profile"}

    profile = profiles[0]
    return {
        "id": profile.id,
        "name": profile.name,
        "website_url": profile.website_url,
        "agency_type": profile.agency_type,
        "description": profile.description,
        "services_offered": profile.services_offered,
        "target_industry": profile.target_industry,
        "target_location": profile.target_location,
        "is_active": profile.is_active,
    }


@router.post("/profile/upload-brochure")
async def upload_brochure(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    """Upload agency brochure"""
    # Create uploads directory
    upload_dir = Path("data/brochures")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = upload_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update profile
    result = await db.execute(select(AgencyProfile))
    profiles = result.scalars().all()

    if profiles:
        profile = profiles[0]
        profile.brochure_path = str(file_path)
        await db.commit()

    return {"filename": file.filename, "path": str(file_path), "status": "uploaded"}


@router.post("/discover")
async def discover_leads(
    agency_type: str,
    location: str = Query("India"),
    max_results: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Discover potential clients"""
    discovery = AgencyLeadDiscovery()
    validator = AgencyEmailValidator()

    leads = discovery.search_businesses(
        agency_type=agency_type, location=location, max_results=max_results
    )

    # Validate emails
    validated_leads = []
    for lead in leads:
        email = lead.get("email")
        if email:
            result = validator.validate_business_email(email)
            if result["is_valid"]:
                lead["email_valid"] = result["is_valid"]
                lead["validation_score"] = result["confidence_score"]
                validated_leads.append(lead)

    return {
        "discovered": len(leads),
        "validated": len(validated_leads),
        "leads": validated_leads[:20],
    }


@router.post("/run")
async def run_agency_pipeline(
    agency_type: str,
    max_leads: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Run the full agency outreach pipeline"""
    from app.core.config import get_settings

    settings = get_settings()

    # Get agency profile
    result = await db.execute(select(AgencyProfile))
    profiles = result.scalars().all()

    if not profiles:
        raise HTTPException(
            status_code=400, detail="No agency profile found. Create one first."
        )

    profile = profiles[0]

    # Run pipeline
    pipeline = AgencyPipeline(db, settings)

    results = await pipeline.run_agency_pipeline(
        agency_type=agency_type,
        agency_name=profile.name,
        agency_url=profile.website_url,
        agency_services=profile.services_offered or "web development services",
        brochure_path=profile.brochure_path,
        location=profile.target_location or "India",
        max_leads=max_leads,
    )

    return results


@router.get("/leads")
async def get_target_leads(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get discovered target leads"""
    query = select(TargetLead)

    if status:
        query = query.where(TargetLead.status == status)

    query = query.offset(skip).limit(limit).order_by(TargetLead.created_at.desc())
    result = await db.execute(query)
    leads = result.scalars().all()

    return [
        {
            "id": lead.id,
            "business_name": lead.business_name,
            "website": lead.website,
            "email": lead.email,
            "phone": lead.phone,
            "contact_name": lead.contact_name,
            "redesign_needed": lead.redesign_needed,
            "redesign_priority": lead.redesign_priority,
            "status": lead.status,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
        }
        for lead in leads
    ]


@router.get("/validate-email")
async def validate_email(email: str):
    """Validate a business email"""
    validator = AgencyEmailValidator()
    result = validator.validate_business_email(email)
    return result


@router.post("/leads/import")
async def import_target_leads(leads: List[dict], db: AsyncSession = Depends(get_db)):
    """Import target leads to database"""
    imported = 0

    for lead_data in leads:
        existing = await db.execute(
            select(TargetLead).where(
                or_(
                    TargetLead.email == lead_data.get("email"),
                    TargetLead.website == lead_data.get("website"),
                )
            )
        )
        if existing.scalar_one_or_none():
            continue

        lead = TargetLead(
            business_name=lead_data.get("business_name"),
            website=lead_data.get("website"),
            email=lead_data.get("email"),
            phone=lead_data.get("phone"),
            contact_name=lead_data.get("contact_name"),
            contact_person=lead_data.get("contact_person"),
            industry=lead_data.get("industry"),
            location=lead_data.get("location"),
            redesign_needed=lead_data.get("redesign_needed", False),
            redesign_priority=lead_data.get("redesign_priority", "low"),
            source=lead_data.get("source", "manual"),
        )
        db.add(lead)
        imported += 1

    await db.commit()

    return {"imported": imported, "total": len(leads)}
