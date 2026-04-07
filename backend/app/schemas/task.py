from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class TaskResponse(BaseModel):
    id: UUID
    task_type: str
    status: str
    result: Optional[str]
    error: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
