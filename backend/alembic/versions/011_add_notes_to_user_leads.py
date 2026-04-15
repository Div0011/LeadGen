"""Add notes column to user_leads

Revision ID: 011
Revises: 010
Create Date: 2026-04-15

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "011"
down_revision: Union[str, None] = "010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("user_leads")]

    if "notes" not in columns:
        op.add_column("user_leads", sa.Column("notes", sa.Text(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("user_leads")]

    if "notes" in columns:
        op.drop_column("user_leads", "notes")
