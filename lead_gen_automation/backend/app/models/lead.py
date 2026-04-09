import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, Enum, Integer, Boolean

try:
    from sqlalchemy.dialects.postgresql import UUID

    USE_UUID = True
except ImportError:
    USE_UUID = False
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class LeadStatus(enum.Enum):
    scraped = "scraped"
    validated = "validated"
    sent = "sent"
    replied = "replied"
    bounced = "bounced"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String(255), nullable=False)
    website = Column(String(500), nullable=True)
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False, unique=True)
    linkedin = Column(String(500), nullable=True)
    status = Column(
        Enum(LeadStatus),
        default=LeadStatus.scraped,
        nullable=False,
    )
    date_sent = Column(DateTime(timezone=True), nullable=True)
    date_replied = Column(DateTime(timezone=True), nullable=True)
    reply_content = Column(Text, nullable=True)
    source = Column(String(100), nullable=True, default="duckduckgo")
    notes = Column(Text, nullable=True)
    brochure_sent = Column(String(10), default="false", nullable=True)
    date_brochure_sent = Column(DateTime(timezone=True), nullable=True)

    # Email tracking fields
    email_opened = Column(Boolean, default=False, nullable=False)
    email_opened_at = Column(DateTime(timezone=True), nullable=True)
    brochure_clicked = Column(Boolean, default=False, nullable=False)
    brochure_clicked_at = Column(DateTime(timezone=True), nullable=True)
    follow_up_sent = Column(Boolean, default=False, nullable=False)
    follow_up_count = Column(Integer, default=0, nullable=False)
    follow_up_scheduled_at = Column(DateTime(timezone=True), nullable=True)
    last_follow_up_sent_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Lead {self.business_name} ({self.email})>"
