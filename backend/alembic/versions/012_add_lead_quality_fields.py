"""Add lead quality fields to user_leads

Revision ID: 012
Revises: 011
Create Date: 2026-04-15

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "012"
down_revision: Union[str, None] = "011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("user_leads")]

    if "website_status" not in columns:
        op.add_column(
            "user_leads", sa.Column("website_status", sa.String(20), nullable=True)
        )

    if "evidence" not in columns:
        op.add_column("user_leads", sa.Column("evidence", sa.Text(), nullable=True))

    if "recommended_service_type" not in columns:
        op.add_column(
            "user_leads",
            sa.Column("recommended_service_type", sa.String(50), nullable=True),
        )

    if "lead_priority_score" not in columns:
        op.add_column(
            "user_leads", sa.Column("lead_priority_score", sa.Integer(), nullable=True)
        )

    if "primary_contact_method" not in columns:
        op.add_column(
            "user_leads",
            sa.Column("primary_contact_method", sa.String(20), nullable=True),
        )

    if "outreach_angle" not in columns:
        op.add_column(
            "user_leads", sa.Column("outreach_angle", sa.Text(), nullable=True)
        )

    if "google_maps_url" not in columns:
        op.add_column(
            "user_leads", sa.Column("google_maps_url", sa.String(500), nullable=True)
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [col["name"] for col in inspector.get_columns("user_leads")]

    cols_to_drop = [
        "google_maps_url",
        "outreach_angle",
        "primary_contact_method",
        "lead_priority_score",
        "recommended_service_type",
        "evidence",
        "website_status",
    ]

    for col in cols_to_drop:
        if col in columns:
            op.drop_column("user_leads", col)
