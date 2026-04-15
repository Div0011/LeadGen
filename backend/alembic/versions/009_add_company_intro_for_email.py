"""Add company_intro_for_email column to users

Revision ID: 009
Revises: 008
Create Date: 2026-04-15

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "009"
down_revision: Union[str, None] = "008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("users")]

    if "company_intro_for_email" not in columns:
        op.add_column(
            "users",
            sa.Column("company_intro_for_email", sa.String(1000), nullable=True),
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("users")]

    if "company_intro_for_email" in columns:
        op.drop_column("users", "company_intro_for_email")
