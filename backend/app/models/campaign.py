import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    target_industry = Column(String(100), nullable=False)
    target_location = Column(String(100), nullable=True)
    status = Column(String(50), default="draft", nullable=False)
    leads_count = Column(Integer, default=0, nullable=False)
    emails_sent = Column(Integer, default=0, nullable=False)
    replies = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Campaign {self.name}>"
