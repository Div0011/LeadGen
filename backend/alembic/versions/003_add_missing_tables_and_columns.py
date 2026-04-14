"""add missing tables and columns for leads tracking

Revision ID: 003
Revises: 002
Create Date: 2026-04-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ===== Fix Leads Table - Add Missing Columns =====
    inspector = sa.inspect(op.get_bind())
    leads_columns = [c.name for c in inspector.get_columns('leads')]
    
    # Add missing columns to leads table
    missing_columns = [
        ('phone', sa.Column("phone", sa.String(50), nullable=True)),
        ('email_valid', sa.Column("email_valid", sa.Boolean(), nullable=True)),
        ('email_validated_at', sa.Column("email_validated_at", sa.DateTime(timezone=True), nullable=True)),
        ('email_validation_source', sa.Column("email_validation_source", sa.String(50), nullable=True)),
        ('email_validation_status', sa.Column("email_validation_status", sa.String(50), nullable=True)),
        ('brochure_sent', sa.Column("brochure_sent", sa.String(10), nullable=True, server_default="false")),
        ('date_brochure_sent', sa.Column("date_brochure_sent", sa.DateTime(timezone=True), nullable=True)),
        ('email_opened', sa.Column("email_opened", sa.Boolean(), nullable=False, server_default="false")),
        ('email_opened_at', sa.Column("email_opened_at", sa.DateTime(timezone=True), nullable=True)),
        ('brochure_clicked', sa.Column("brochure_clicked", sa.Boolean(), nullable=False, server_default="false")),
        ('brochure_clicked_at', sa.Column("brochure_clicked_at", sa.DateTime(timezone=True), nullable=True)),
        ('follow_up_sent', sa.Column("follow_up_sent", sa.Boolean(), nullable=False, server_default="false")),
        ('follow_up_count', sa.Column("follow_up_count", sa.Integer(), nullable=False, server_default="0")),
        ('follow_up_scheduled_at', sa.Column("follow_up_scheduled_at", sa.DateTime(timezone=True), nullable=True)),
        ('last_follow_up_sent_at', sa.Column("last_follow_up_sent_at", sa.DateTime(timezone=True), nullable=True)),
    ]
    
    for col_name, col_def in missing_columns:
        if col_name not in leads_columns:
            op.add_column('leads', col_def)
    
    # ===== Create user_leads Table =====
    # Only create if it doesn't exist
    if 'user_leads' not in inspector.get_table_names():
        op.create_table(
            'user_leads',
            sa.Column('id', sa.String(36), nullable=False, primary_key=True),
            sa.Column('user_id', sa.String(36), nullable=False, index=True),
            sa.Column('campaign_id', sa.String(36), nullable=True, index=True),
            sa.Column('business_name', sa.String(255), nullable=False),
            sa.Column('website', sa.String(500), nullable=True),
            sa.Column('email', sa.String(255), nullable=True),
            sa.Column('phone', sa.String(50), nullable=True),
            sa.Column('contact_name', sa.String(255), nullable=True),
            sa.Column('industry', sa.String(100), nullable=True),
            sa.Column('location', sa.String(100), nullable=True),
            sa.Column('is_redesign_needed', sa.Boolean(), nullable=False, server_default="false"),
            sa.Column('email_valid', sa.Boolean(), nullable=False, server_default="false"),
            sa.Column('source', sa.String(50), nullable=False, server_default="manual"),
            sa.Column('status', sa.String(20), nullable=False, server_default="new"),
            sa.Column('delivered', sa.Boolean(), nullable=False, server_default="false"),
            sa.Column('delivered_at', sa.DateTime(), nullable=True),
            sa.Column('email_opened', sa.Boolean(), nullable=False, server_default="false"),
            sa.Column('email_opened_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )
    
    # ===== Create campaign_runs Table =====
    # Only create if it doesn't exist
    if 'campaign_runs' not in inspector.get_table_names():
        op.create_table(
            'campaign_runs',
            sa.Column('id', sa.String(36), nullable=False, primary_key=True),
            sa.Column('user_id', sa.String(36), nullable=False, index=True),
            sa.Column('agency_type', sa.String(100), nullable=True),
            sa.Column('location', sa.String(100), nullable=True),
            sa.Column('leads_found', sa.Integer(), nullable=False, server_default="0"),
            sa.Column('leads_validated', sa.Integer(), nullable=False, server_default="0"),
            sa.Column('leads_delivered', sa.Integer(), nullable=False, server_default="0"),
            sa.Column('status', sa.String(20), nullable=False, server_default="pending"),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
        )


def downgrade() -> None:
    # Drop tables in reverse order
    if 'campaign_runs' in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table('campaign_runs')
    
    if 'user_leads' in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table('user_leads')
    
    # Drop columns from leads table
    inspector = sa.inspect(op.get_bind())
    leads_columns = [c.name for c in inspector.get_columns('leads')]
    
    columns_to_drop = [
        'phone', 'email_valid', 'email_validated_at', 'email_validation_source',
        'email_validation_status', 'brochure_sent', 'date_brochure_sent',
        'email_opened', 'email_opened_at', 'brochure_clicked', 'brochure_clicked_at',
        'follow_up_sent', 'follow_up_count', 'follow_up_scheduled_at', 'last_follow_up_sent_at'
    ]
    
    for col_name in columns_to_drop:
        if col_name in leads_columns:
            op.drop_column('leads', col_name)
