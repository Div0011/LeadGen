from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    company: Optional[str] = None
    emailFrom: Optional[str] = None
    emailProvider: Optional[str] = None
    googleSheetsApiKey: Optional[str] = None
    slackWebhook: Optional[str] = None

    # New fields for frontend
    smtpEmail: Optional[str] = None
    smtpPassword: Optional[str] = None
    brochureUrl: Optional[str] = None
    leadType: Optional[str] = None
    leadVolume: Optional[str] = None
    reportFrequency: Optional[str] = None


def get_user_smtp_settings(user: User) -> dict:
    """Get SMTP settings from user record or fall back to global config"""
    from app.core.config import get_settings

    global_settings = get_settings()

    smtp_email = user.smtp_username or global_settings.SMTP_USER
    smtp_password = user.smtp_password or global_settings.SMTP_PASSWORD

    return {
        "smtp_host": user.smtp_host or global_settings.SMTP_HOST,
        "smtp_port": int(user.smtp_port)
        if user.smtp_port
        else global_settings.SMTP_PORT,
        "smtp_user": smtp_email,
        "smtp_password": smtp_password,
        "smtp_use_tls": user.smtp_use_tls
        if user.smtp_use_tls is not None
        else global_settings.SMTP_USE_TLS,
        "email_from": smtp_email or global_settings.EMAIL_FROM,
    }


def store_user_smtp_settings(user: User, smtp_email: str, smtp_password: str) -> None:
    """Store user's SMTP settings in their record"""
    user.smtp_username = smtp_email
    user.smtp_password = smtp_password
    user.smtp_host = "smtp.gmail.com"
    user.smtp_port = "587"
    user.smtp_use_tls = True


@router.get("")
async def get_settings(current_user: User = Depends(get_current_user)):
    name_parts = current_user.name.split(" ", 1) if current_user.name else ["", ""]
    first_name = name_parts[0] if len(name_parts) > 0 else ""
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    return {
        "firstName": first_name,
        "lastName": last_name,
        "email": current_user.email,
        "company": current_user.company_name or "",
        "smtpEmail": current_user.smtp_username or "",
        "smtpPassword": current_user.smtp_password or "",
        "brochureUrl": current_user.brochure_filename or "",
        "leadType": current_user.target_industry
        or current_user.company_description
        or "",
        "leadVolume": str(current_user.max_leads_per_day)
        if current_user.max_leads_per_day
        else "100",
        "reportFrequency": "weekly",  # Default placeholder
    }


@router.put("")
async def update_settings(
    settings: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if settings.firstName or settings.lastName:
        current_user.name = (
            f"{settings.firstName or ''} {settings.lastName or ''}".strip()
        )
    if settings.company is not None:
        current_user.company_name = settings.company

    if settings.smtpEmail is not None:
        current_user.smtp_username = settings.smtpEmail
    if settings.smtpPassword is not None:
        current_user.smtp_password = settings.smtp_password

    if settings.leadType is not None:
        current_user.target_industry = settings.leadType[
            :100
        ]  # Fit into varchar(100) and String(500)
        current_user.company_description = settings.leadType[:500]

    if settings.leadVolume is not None:
        try:
            current_user.max_leads_per_day = int(settings.leadVolume)
        except ValueError:
            pass

    if settings.brochureUrl is not None:
        current_user.brochure_filename = settings.brochureUrl

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Settings updated successfully", "data": settings.dict()}


@router.get("/smtp-config")
async def get_smtp_config(current_user: User = Depends(get_current_user)):
    """Get user's SMTP configuration"""
    return get_user_smtp_settings(current_user)
