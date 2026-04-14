"""fix settings_verified_at column timezone support

Revision ID: 007
Revises: 006
Create Date: 2026-04-14

This migration ensures settings_verified_at has proper timezone support
by converting it from TIMESTAMP WITHOUT TIME ZONE to TIMESTAMP WITH TIME ZONE
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    
    # Check if users table exists and settings_verified_at column exists
    if 'users' in inspector.get_table_names():
        users_columns = [c['name'] for c in inspector.get_columns('users')]
        
        if 'settings_verified_at' in users_columns:
            # Get the column details
            col = [c for c in inspector.get_columns('users') if c['name'] == 'settings_verified_at'][0]
            col_type = str(col['type'])
            
            # If it's without timezone, we need to alter it
            if 'WITH TIME ZONE' not in col_type:
                # Drop and recreate with timezone support
                op.alter_column(
                    'users',
                    'settings_verified_at',
                    existing_type=sa.DateTime(timezone=False),
                    type_=sa.DateTime(timezone=True),
                    nullable=True
                )


def downgrade() -> None:
    # This is intentionally a no-op downgrade
    pass
