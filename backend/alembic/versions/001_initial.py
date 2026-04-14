"""initial migration

Revision ID: 001
Revises:
Create Date: 2026-04-02

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check which tables already exist to make this migration idempotent
    inspector = sa.inspect(op.get_bind())
    existing_tables = [t['name'] for t in inspector.get_tables()]
    
    if 'campaigns' not in existing_tables:
        op.create_table(
            "campaigns",
            sa.Column(
                "id",
                postgresql.UUID(as_uuid=True),
                primary_key=True,
                server_default=sa.text("gen_random_uuid()"),
            ),
            sa.Column("name", sa.String(255), nullable=False, unique=True),
            sa.Column("target_industry", sa.String(100), nullable=False),
            sa.Column("target_location", sa.String(100), nullable=True),
            sa.Column("status", sa.String(50), nullable=False, server_default="draft"),
            sa.Column("leads_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("emails_sent", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("replies", sa.Integer(), nullable=False, server_default="0"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    if 'email_templates' not in existing_tables:
        op.create_table(
            "email_templates",
            sa.Column(
                "id",
                postgresql.UUID(as_uuid=True),
                primary_key=True,
                server_default=sa.text("gen_random_uuid()"),
            ),
            sa.Column("name", sa.String(255), nullable=False, unique=True),
            sa.Column("subject", sa.String(500), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    if 'users' not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("email", sa.String(255), nullable=False, unique=True),
            sa.Column("password_hash", sa.String(255), nullable=False),
            sa.Column("name", sa.String(255), nullable=True),
            sa.Column("company_name", sa.String(255), nullable=True),
            sa.Column("company_website", sa.String(500), nullable=True),
            sa.Column("company_description", sa.String(500), nullable=True),
            sa.Column("agency_type", sa.String(100), nullable=True),
            sa.Column("services", sa.String(500), nullable=True),
            sa.Column("target_industry", sa.String(100), nullable=True),
            sa.Column("target_location", sa.String(100), nullable=True),
            sa.Column("smtp_host", sa.String(100), nullable=False, server_default="smtp.gmail.com"),
            sa.Column("smtp_port", sa.String(10), nullable=False, server_default="587"),
            sa.Column("smtp_username", sa.String(255), nullable=True),
            sa.Column("smtp_password", sa.String(255), nullable=True),
            sa.Column("smtp_use_tls", sa.Boolean(), nullable=False, server_default="true"),
            sa.Column("brochure_filename", sa.String(255), nullable=True),
            sa.Column("brochure_path", sa.String(500), nullable=True),
            sa.Column("brochure_data", sa.LargeBinary(), nullable=True),
            sa.Column("max_leads_per_day", sa.Integer(), nullable=False, server_default="50"),
            sa.Column("max_total_leads", sa.Integer(), nullable=False, server_default="1000"),
            sa.Column("settings_verified", sa.Boolean(), nullable=False, server_default="false"),
            sa.Column("settings_verified_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
            sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
            sa.Column("verification_token", sa.String(64), nullable=True),
            sa.Column("api_key", sa.String(64), nullable=True, unique=True),
            sa.Column("lead_quota", sa.Integer(), nullable=False, server_default="100"),
            sa.Column("leads_used", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Index("ix_users_email", "email"),
            sa.Index("ix_users_api_key", "api_key"),
        )

    # Create ENUM type if it doesn't exist
    try:
        lead_status_enum = postgresql.ENUM(
            "scraped",
            "validated",
            "sent",
            "replied",
            "bounced",
            name="leadstatus",
            create_type=True,
        )
        lead_status_enum.create(op.get_bind(), checkfirst=True)
    except Exception:
        pass  # ENUM might already exist

    if 'leads' not in existing_tables:
        op.create_table(
            "leads",
            sa.Column(
                "id",
                postgresql.UUID(as_uuid=True),
                primary_key=True,
                server_default=sa.text("gen_random_uuid()"),
            ),
            sa.Column("business_name", sa.String(255), nullable=False),
            sa.Column("website", sa.String(500), nullable=True),
            sa.Column("contact_person", sa.String(255), nullable=True),
            sa.Column("email", sa.String(255), nullable=False, unique=True),
            sa.Column("linkedin", sa.String(500), nullable=True),
            sa.Column("status", postgresql.ENUM("scraped", "validated", "sent", "replied", "bounced", name="leadstatus"), nullable=False, server_default="scraped"),
            sa.Column("date_sent", sa.DateTime(timezone=True), nullable=True),
            sa.Column("date_replied", sa.DateTime(timezone=True), nullable=True),
            sa.Column("reply_content", sa.Text(), nullable=True),
            sa.Column("source", sa.String(100), nullable=True, server_default="duckduckgo"),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    if 'tasks' not in existing_tables:
        op.create_table(
            "tasks",
            sa.Column(
                "id",
                postgresql.UUID(as_uuid=True),
                primary_key=True,
                server_default=sa.text("gen_random_uuid()"),
            ),
            sa.Column("task_type", sa.String(100), nullable=False),
            sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
            sa.Column("result", sa.Text(), nullable=True),
            sa.Column("error", sa.Text(), nullable=True),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )


def downgrade() -> None:
    # Drop tables if they exist (idempotent)
    inspector = sa.inspect(op.get_bind())
    existing_tables = [t['name'] for t in inspector.get_tables()]
    
    if 'tasks' in existing_tables:
        op.drop_table("tasks")
    if 'leads' in existing_tables:
        op.drop_table("leads")
    
    # Drop ENUM type if it exists
    try:
        lead_status_enum = postgresql.ENUM(name="leadstatus")
        lead_status_enum.drop(op.get_bind())
    except Exception:
        pass
    
    if 'email_templates' in existing_tables:
        op.drop_table("email_templates")
    if 'campaigns' in existing_tables:
        op.drop_table("campaigns")
    if 'users' in existing_tables:
        op.drop_table("users")
