"""Add Mailjet integration columns to users table

Revision ID: 013
Revises: 012
Create Date: 2026-04-15

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "013"
down_revision: Union[str, None] = "012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("users")]

    if "mailjet_api_key" not in columns:
        op.add_column(
            "users", sa.Column("mailjet_api_key", sa.String(100), nullable=True)
        )

    if "mailjet_api_secret" not in columns:
        op.add_column(
            "users", sa.Column("mailjet_api_secret", sa.String(100), nullable=True)
        )

    if "mailjet_enabled" not in columns:
        op.add_column(
            "users",
            sa.Column(
                "mailjet_enabled", sa.Boolean(), nullable=False, server_default="false"
            ),
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("users")]

    cols_to_drop = ["mailjet_enabled", "mailjet_api_secret", "mailjet_api_key"]

    for col in cols_to_drop:
        if col in columns:
            op.drop_column("users", col)
