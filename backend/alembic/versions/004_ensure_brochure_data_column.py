"""ensure brochure_data column exists in users table

Revision ID: 004
Revises: 003
Create Date: 2026-04-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if brochure_data column already exists in users table
    inspector = sa.inspect(op.get_bind())
    users_columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'brochure_data' not in users_columns:
        op.add_column('users', sa.Column('brochure_data', sa.LargeBinary(), nullable=True))


def downgrade() -> None:
    # Drop brochure_data column from users table if it exists
    inspector = sa.inspect(op.get_bind())
    users_columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'brochure_data' in users_columns:
        op.drop_column('users', 'brochure_data')
