"""fix incomplete user_leads and campaign_runs tables

Revision ID: 006
Revises: 005
Create Date: 2026-04-14

This migration adds missing columns to user_leads and campaign_runs tables
that were created with incomplete schemas in earlier deployments.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check what columns already exist
    inspector = sa.inspect(op.get_bind())
    
    # ===== Fix user_leads table if it exists =====
    if 'user_leads' in inspector.get_table_names():
        user_leads_columns = [c['name'] for c in inspector.get_columns('user_leads')]
        
        # Add missing columns
        if 'campaign_id' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('campaign_id', sa.String(36), nullable=True, index=True))
        if 'business_name' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('business_name', sa.String(255), nullable=True))
        if 'website' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('website', sa.String(500), nullable=True))
        if 'email' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('email', sa.String(255), nullable=True))
        if 'phone' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('phone', sa.String(50), nullable=True))
        if 'contact_name' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('contact_name', sa.String(255), nullable=True))
        if 'industry' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('industry', sa.String(100), nullable=True))
        if 'location' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('location', sa.String(100), nullable=True))
        if 'is_redesign_needed' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('is_redesign_needed', sa.Boolean(), nullable=False, server_default="false"))
        if 'email_valid' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('email_valid', sa.Boolean(), nullable=False, server_default="false"))
        if 'source' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('source', sa.String(50), nullable=False, server_default="manual"))
        if 'status' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('status', sa.String(20), nullable=False, server_default="new"))
        if 'delivered' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('delivered', sa.Boolean(), nullable=False, server_default="false"))
        if 'delivered_at' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('delivered_at', sa.DateTime(), nullable=True))
        if 'email_opened' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('email_opened', sa.Boolean(), nullable=False, server_default="false"))
        if 'email_opened_at' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('email_opened_at', sa.DateTime(timezone=True), nullable=True))
        if 'created_at' not in user_leads_columns:
            op.add_column('user_leads', sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False))
    
    # ===== Fix campaign_runs table if it exists =====
    if 'campaign_runs' in inspector.get_table_names():
        campaign_runs_columns = [c['name'] for c in inspector.get_columns('campaign_runs')]
        
        # Add missing columns
        if 'user_id' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('user_id', sa.String(36), nullable=True, index=True))
        if 'agency_type' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('agency_type', sa.String(100), nullable=True))
        if 'location' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('location', sa.String(100), nullable=True))
        if 'leads_found' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('leads_found', sa.Integer(), nullable=False, server_default="0"))
        if 'leads_validated' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('leads_validated', sa.Integer(), nullable=False, server_default="0"))
        if 'leads_delivered' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('leads_delivered', sa.Integer(), nullable=False, server_default="0"))
        if 'status' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('status', sa.String(20), nullable=False, server_default="pending"))
        if 'created_at' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False))
        if 'completed_at' not in campaign_runs_columns:
            op.add_column('campaign_runs', sa.Column('completed_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # This is intentionally a no-op downgrade to preserve data
    # Removing columns could cause data loss
    pass
