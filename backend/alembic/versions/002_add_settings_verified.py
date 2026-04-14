"""add settings_verified columns to users table

Revision ID: 002
Revises: 001
Create Date: 2026-04-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This migration handles adding settings_verified columns to existing databases
    # If 001 migration was already applied (new deployments), these columns will already exist
    # This adds them for existing databases that have the users table without these columns
    
    inspector = sa.inspect(op.get_bind())
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'settings_verified' not in columns:
        op.add_column(
            "users",
            sa.Column("settings_verified", sa.Boolean(), nullable=False, server_default="false"),
        )
    
    if 'settings_verified_at' not in columns:
        op.add_column(
            "users",
            sa.Column("settings_verified_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    # Only drop columns if they exist
    inspector = sa.inspect(op.get_bind())
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'settings_verified_at' in columns:
        op.drop_column("users", "settings_verified_at")
    
    if 'settings_verified' in columns:
        op.drop_column("users", "settings_verified")

