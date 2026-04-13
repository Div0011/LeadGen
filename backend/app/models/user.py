from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.sql import func
import uuid
import hashlib
import secrets

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    company_website = Column(String(500), nullable=True)
    company_description = Column(String(500), nullable=True)
    agency_type = Column(String(100), nullable=True)
    services = Column(String(500), nullable=True)
    target_industry = Column(String(100), nullable=True)
    target_location = Column(String(100), nullable=True)

    # SMTP Settings (for sending emails)
    smtp_host = Column(String(100), default="smtp.gmail.com")
    smtp_port = Column(String(10), default="587")
    smtp_username = Column(String(255), nullable=True)
    smtp_password = Column(String(255), nullable=True)
    smtp_use_tls = Column(Boolean, default=True)

    # Brochure
    brochure_filename = Column(String(255), nullable=True)
    brochure_path = Column(String(500), nullable=True)

    # Lead Generation Settings
    target_industry = Column(String(100), nullable=True)
    target_location = Column(String(100), nullable=True)
    max_leads_per_day = Column(Integer, default=50)
    max_total_leads = Column(Integer, default=1000)

    # Settings verification status
    settings_verified = Column(Boolean, default=False)
    settings_verified_at = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(64), nullable=True)
    api_key = Column(String(64), unique=True, nullable=True)
    lead_quota = Column(Integer, default=100)
    leads_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def set_password(self, password: str) -> None:
        """Hash and set password"""
        salt = secrets.token_hex(16)
        hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
        self.password_hash = f"{salt}${hash.hex()}"

    def check_password(self, password: str) -> bool:
        """Verify password"""
        try:
            salt, hash_hex = self.password_hash.split("$")
            hash = hashlib.pbkdf2_hmac(
                "sha256", password.encode(), salt.encode(), 100000
            )
            return hash.hex() == hash_hex
        except:
            return False

    def generate_api_key(self) -> str:
        """Generate API key"""
        self.api_key = secrets.token_hex(32)
        return self.api_key

    def can_generate_leads(self) -> bool:
        """Check if user can generate more leads"""
        return self.leads_used < self.lead_quota

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class UserLead(Base):
    __tablename__ = "user_leads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    campaign_id = Column(String(36), nullable=True, index=True)
    business_name = Column(String(255), nullable=False)
    website = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    contact_name = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    is_redesign_needed = Column(Boolean, default=False)
    email_valid = Column(Boolean, default=False)
    source = Column(String(50), default="manual")
    status = Column(String(20), default="new")
    delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime, nullable=True)
    email_opened = Column(Boolean, default=False)
    email_opened_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<UserLead {self.business_name}>"


class CampaignRun(Base):
    __tablename__ = "campaign_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    agency_type = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    leads_found = Column(Integer, default=0)
    leads_validated = Column(Integer, default=0)
    leads_delivered = Column(Integer, default=0)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<CampaignRun {self.id}>"
