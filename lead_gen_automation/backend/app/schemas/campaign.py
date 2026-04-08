from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_industry: str = Field(..., min_length=1, max_length=100)
    target_location: Optional[str] = Field(None, max_length=100)


class CampaignResponse(BaseModel):
    id: UUID
    name: str
    target_industry: str
    target_location: Optional[str]
    status: str
    leads_count: int
    emails_sent: int
    replies: int
    created_at: datetime

    class Config:
        from_attributes = True
