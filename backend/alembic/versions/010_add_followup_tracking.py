"""Add follow-up and reply tracking columns to user_leads

Revision ID: 010
Revises: 009
Create Date: 2026-04-15

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "010"
down_revision: Union[str, None] = "009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("user_leads")]

    if "follow_up_sent" not in columns:
        op.add_column(
            "user_leads",
            sa.Column(
                "follow_up_sent", sa.Boolean(), server_default="false", nullable=True
            ),
        )

    if "follow_up_sent_at" not in columns:
        op.add_column(
            "user_leads",
            sa.Column("follow_up_sent_at", sa.DateTime(timezone=True), nullable=True),
        )

    if "reply_received" not in columns:
        op.add_column(
            "user_leads",
            sa.Column(
                "reply_received", sa.Boolean(), server_default="false", nullable=True
            ),
        )

    if "reply_received_at" not in columns:
        op.add_column(
            "user_leads",
            sa.Column("reply_received_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("user_leads")]

    if "reply_received_at" in columns:
        op.drop_column("user_leads", "reply_received_at")
    if "reply_received" in columns:
        op.drop_column("user_leads", "reply_received")
    if "follow_up_sent_at" in columns:
        op.drop_column("user_leads", "follow_up_sent_at")
    if "follow_up_sent" in columns:
        op.drop_column("user_leads", "follow_up_sent")
