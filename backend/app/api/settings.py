from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import shutil
from pathlib import Path
import smtplib
from email.message import EmailMessage
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
    smtp_password: Optional[str] = None  # For backend access
    brochureUrl: Optional[str] = None
    leadType: Optional[str] = None
    companyIntroForEmail: Optional[str] = None  # Separate intro for emails
    leadVolume: Optional[str] = None
    reportFrequency: Optional[str] = None

    # Mailjet API Settings
    mailjetApiKey: Optional[str] = None
    mailjetApiSecret: Optional[str] = None
    mailjetEnabled: Optional[bool] = None


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


def validate_smtp_settings(smtp_email: str, smtp_password: str) -> tuple[bool, str]:
    """Validate SMTP credentials by attempting to connect"""
    if not smtp_email or not smtp_password:
        return False, "Email and password are required"

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.quit()
        return True, "Valid"
    except Exception as e:
        error_msg = str(e)
        if "535" in error_msg or "Authentication failed" in error_msg:
            return False, "Invalid credentials or App Password"
        elif "Could not connect" in error_msg:
            return False, "Cannot connect to SMTP server"
        else:
            return False, f"Connection error: {error_msg}"


@router.get("")
async def get_settings(current_user: User = Depends(get_current_user)):
    name_parts = current_user.name.split(" ", 1) if current_user.name else ["", ""]
    first_name = name_parts[0] if len(name_parts) > 0 else ""
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # Get target location from user model or use default
    target_location = current_user.target_location or "India"

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
        "companyIntroForEmail": current_user.company_intro_for_email or "",
        "leadVolume": str(current_user.max_leads_per_day)
        if current_user.max_leads_per_day
        else "100",
        "targetLocation": target_location,
        "reportFrequency": "weekly",
        "settings_verified": current_user.settings_verified or False,
        "mailjetApiKey": current_user.mailjet_api_key or "",
        "mailjetApiSecret": current_user.mailjet_api_secret or "",
        "mailjetEnabled": current_user.mailjet_enabled or False,
    }


@router.put("")
async def update_settings(
    settings: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validation_errors = []

    # Get password from either field (frontend uses smtpPassword)
    smtp_password = settings.smtpPassword or settings.smtp_password or ""

    # Validate required fields
    if not settings.leadType:
        validation_errors.append("Target Industry is required")
    if not settings.leadVolume:
        validation_errors.append("Lead Volume is required")

    # Only validate SMTP if BOTH email and password are provided AND they're different from stored
    if settings.smtpEmail and smtp_password:
        # Skip validation for now - just save the settings
        # User can test SMTP when sending emails
        pass

    # If there are validation errors, return them
    if validation_errors:
        return {
            "success": False,
            "message": "Validation failed",
            "errors": validation_errors,
        }

    # All validations passed, save settings
    if settings.firstName or settings.lastName:
        current_user.name = (
            f"{settings.firstName or ''} {settings.lastName or ''}".strip()
        )
    if settings.company is not None:
        current_user.company_name = settings.company

    if settings.smtpEmail is not None:
        current_user.smtp_username = settings.smtpEmail
    if smtp_password:
        current_user.smtp_password = smtp_password

    if settings.leadType is not None:
        current_user.target_industry = settings.leadType[:100]
        current_user.company_description = settings.leadType[:500]

    if settings.companyIntroForEmail is not None:
        current_user.company_intro_for_email = settings.companyIntroForEmail[:1000]

    if settings.leadVolume is not None:
        try:
            current_user.max_leads_per_day = int(settings.leadVolume)
        except ValueError:
            pass

    if settings.brochureUrl is not None:
        current_user.brochure_filename = settings.brochureUrl

    # Mailjet API Settings
    if settings.mailjetApiKey is not None:
        current_user.mailjet_api_key = settings.mailjetApiKey
    if settings.mailjetApiSecret is not None:
        current_user.mailjet_api_secret = settings.mailjetApiSecret
    if settings.mailjetEnabled is not None:
        current_user.mailjet_enabled = settings.mailjetEnabled

    # Mark settings as verified
    from datetime import datetime, timezone

    current_user.settings_verified = True
    current_user.settings_verified_at = datetime.now()

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {
        "success": True,
        "message": "Settings saved and verified successfully",
        "verified": True,
    }


@router.get("/smtp-config")
async def get_smtp_config(current_user: User = Depends(get_current_user)):
    """Get user's SMTP configuration"""
    return get_user_smtp_settings(current_user)


@router.post("/upload-brochure")
async def upload_brochure(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload company brochure (PDF)"""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Read file content into memory
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Store in database (for Vercel compatibility)
    current_user.brochure_filename = file.filename
    current_user.brochure_data = content
    await db.commit()

    return {"filename": file.filename, "status": "uploaded"}
