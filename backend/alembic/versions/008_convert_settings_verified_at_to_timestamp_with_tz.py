"""convert settings_verified_at to timestamp with timezone using sql

Revision ID: 008
Revises: 007
Create Date: 2026-04-14

This migration properly converts settings_verified_at column type from 
TIMESTAMP WITHOUT TIME ZONE to TIMESTAMP WITH TIME ZONE using SQL-level conversion.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    
    if 'users' in inspector.get_table_names():
        users_columns = [c['name'] for c in inspector.get_columns('users')]
        
        if 'settings_verified_at' in users_columns:
            # Get the current column type
            col = [c for c in inspector.get_columns('users') if c['name'] == 'settings_verified_at'][0]
            col_type = str(col['type'])
            
            # Only convert if it's WITHOUT TIME ZONE
            if 'WITH TIME ZONE' not in col_type:
                # Use raw SQL to convert the column type with proper timezone handling
                op.execute(
                    sa.text(
                        "ALTER TABLE users ALTER COLUMN settings_verified_at TYPE "
                        "TIMESTAMP WITH TIME ZONE USING settings_verified_at AT TIME ZONE 'UTC'"
                    )
                )


def downgrade() -> None:
    # Intentionally no-op to preserve data
    pass
