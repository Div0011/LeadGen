from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class LeadStatusEnum(str, Enum):
    scraped = "scraped"
    validated = "validated"
    sent = "sent"
    replied = "replied"
    bounced = "bounced"


class LeadCreate(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)  # Phone number
    linkedin: Optional[str] = Field(None, max_length=500)
    source: Optional[str] = Field("manual", max_length=100)
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    business_name: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    linkedin: Optional[str] = Field(None, max_length=500)
    status: Optional[LeadStatusEnum] = None
    date_sent: Optional[datetime] = None
    date_replied: Optional[datetime] = None
    reply_content: Optional[str] = None
    notes: Optional[str] = None
    # Email validation fields
    email_valid: Optional[bool] = None
    email_validation_status: Optional[str] = None


class LeadResponse(BaseModel):
    id: UUID
    business_name: str
    website: Optional[str]
    contact_person: Optional[str]
    email: str
    phone: Optional[str] = None  # Phone number
    linkedin: Optional[str]
    status: LeadStatusEnum
    # Email validation
    email_valid: Optional[bool] = None
    email_validated_at: Optional[datetime] = None
    email_validation_source: Optional[str] = None
    email_validation_status: Optional[str] = None
    # Email actions
    date_sent: Optional[datetime]
    date_replied: Optional[datetime]
    reply_content: Optional[str]
    source: Optional[str]
    notes: Optional[str]
    brochure_sent: Optional[str] = "false"
    date_brochure_sent: Optional[datetime] = None
    email_opened: bool = False
    email_opened_at: Optional[datetime] = None
    brochure_clicked: bool = False
    brochure_clicked_at: Optional[datetime] = None
    follow_up_sent: bool = False
    follow_up_count: int = 0
    follow_up_scheduled_at: Optional[datetime] = None
    last_follow_up_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadFilter(BaseModel):
    status: Optional[LeadStatusEnum] = None
    source: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search: Optional[str] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=200)
