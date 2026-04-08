from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class AgencyProfile(Base):
    __tablename__ = "agency_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    website_url = Column(String(500), nullable=False)
    agency_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    services_offered = Column(Text, nullable=True)
    brochure_path = Column(String(500), nullable=True)
    target_industry = Column(String(100), nullable=True)
    target_location = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AgencyProfile {self.name}>"


class TargetLead(Base):
    __tablename__ = "target_leads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String(255), nullable=False)
    website = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    contact_name = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    website_age = Column(Integer, nullable=True)
    redesign_needed = Column(Boolean, default=False)
    redesign_priority = Column(String(20), default="low")
    estimated_budget = Column(String(50), nullable=True)
    source = Column(String(100), nullable=True)
    status = Column(String(20), default="new")
    email_valid = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<TargetLead {self.business_name}>"
