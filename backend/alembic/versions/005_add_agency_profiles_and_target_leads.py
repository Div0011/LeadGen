"""add missing tables: agency_profiles and target_leads

Revision ID: 005
Revises: 004
Create Date: 2026-04-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if agency_profiles table exists
    inspector = sa.inspect(op.get_bind())
    existing_tables = [t['name'] for t in inspector.get_tables()]
    
    # Create agency_profiles table if it doesn't exist
    if 'agency_profiles' not in existing_tables:
        op.create_table(
            'agency_profiles',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('website_url', sa.String(500), nullable=False),
            sa.Column('agency_type', sa.String(100), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('services_offered', sa.Text(), nullable=True),
            sa.Column('brochure_path', sa.String(500), nullable=True),
            sa.Column('target_industry', sa.String(100), nullable=True),
            sa.Column('target_location', sa.String(100), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Index('ix_agency_profiles_name', 'name'),
        )
    
    # Create target_leads table if it doesn't exist
    if 'target_leads' not in existing_tables:
        op.create_table(
            'target_leads',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('business_name', sa.String(255), nullable=False),
            sa.Column('website', sa.String(500), nullable=True),
            sa.Column('email', sa.String(255), nullable=True),
            sa.Column('phone', sa.String(50), nullable=True),
            sa.Column('contact_name', sa.String(255), nullable=True),
            sa.Column('contact_person', sa.String(255), nullable=True),
            sa.Column('industry', sa.String(100), nullable=True),
            sa.Column('location', sa.String(100), nullable=True),
            sa.Column('website_age', sa.Integer(), nullable=True),
            sa.Column('redesign_needed', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('redesign_priority', sa.String(20), nullable=False, server_default='low'),
            sa.Column('estimated_budget', sa.String(50), nullable=True),
            sa.Column('source', sa.String(100), nullable=True),
            sa.Column('status', sa.String(20), nullable=False, server_default='new'),
            sa.Column('email_valid', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Index('ix_target_leads_email', 'email'),
            sa.Index('ix_target_leads_status', 'status'),
        )


def downgrade() -> None:
    # Drop target_leads table if it exists
    inspector = sa.inspect(op.get_bind())
    existing_tables = [t['name'] for t in inspector.get_tables()]
    
    if 'target_leads' in existing_tables:
        op.drop_table('target_leads')
    
    if 'agency_profiles' in existing_tables:
        op.drop_table('agency_profiles')
