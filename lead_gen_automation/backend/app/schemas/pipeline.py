from pydantic import BaseModel, Field
from typing import Optional


class PipelineRunRequest(BaseModel):
    target_industry: str = Field(..., min_length=1)
    target_location: Optional[str] = None
    max_leads: int = Field(50, ge=1, le=500)
    campaign_id: Optional[str] = None
    template_id: Optional[str] = None
    send_emails: bool = True


class PipelineStatus(BaseModel):
    task_id: Optional[str] = None
    stage: str = "idle"
    progress: float = 0.0
    leads_collected: int = 0
    leads_validated: int = 0
    emails_sent: int = 0
    errors: list[str] = []
    is_running: bool = False
