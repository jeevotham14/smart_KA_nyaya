"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-06-29
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from app.db.types import Vector

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "users",
        sa.Column("user_id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("phone", sa.String(32)),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("aadhaar_hash", sa.String(255)),
        sa.Column("language_pref", sa.String(32), nullable=False),
        sa.Column("role", sa.String(40), nullable=False),
        sa.Column("district", sa.String(100)),
        sa.Column("taluk", sa.String(100)),
        sa.Column("dlsa_eligible", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "legal_queries",
        sa.Column("query_id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.user_id")),
        sa.Column("grievance_text", sa.Text(), nullable=False),
        sa.Column("language", sa.String(32), nullable=False),
        sa.Column("legal_category", sa.String(120), nullable=False),
        sa.Column("urgency_level", sa.String(40), nullable=False),
        sa.Column("ai_response", sa.Text(), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "case_objects",
        sa.Column("case_id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.user_id")),
        sa.Column("grievance_text", sa.Text(), nullable=False),
        sa.Column("legal_sections", postgresql.JSONB()),
        sa.Column("court_type", sa.String(120)),
        sa.Column("documents", postgresql.JSONB()),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("prediction_score", sa.Float()),
        sa.Column("estimated_duration_days", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "legal_statutes",
        sa.Column("section_id", sa.Uuid(), primary_key=True),
        sa.Column("act_name", sa.String(180), nullable=False),
        sa.Column("section_number", sa.String(80), nullable=False),
        sa.Column("section_text", sa.Text(), nullable=False),
        sa.Column("keywords", postgresql.ARRAY(sa.Text())),
        sa.Column("applicable_courts", postgresql.ARRAY(sa.Text())),
        sa.Column("state_applicability", sa.String(100), nullable=False),
    )
    op.create_table(
        "precedent_store",
        sa.Column("case_ref", sa.Uuid(), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("court", sa.String(180), nullable=False),
        sa.Column("jurisdiction", sa.String(120), nullable=False),
        sa.Column("year", sa.Integer()),
        sa.Column("outcome", sa.String(255)),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("source_url", sa.String(500)),
        sa.Column("embedding_vector", Vector(1536)),
    )
    op.create_table(
        "generated_documents",
        sa.Column("doc_id", sa.Uuid(), primary_key=True),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("case_objects.case_id")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.user_id")),
        sa.Column("doc_type", sa.String(100), nullable=False),
        sa.Column("content_text", sa.Text(), nullable=False),
        sa.Column("file_url", sa.String(500)),
        sa.Column("format_compliant", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "dlsa_applications",
        sa.Column("app_id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.user_id")),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("case_objects.case_id")),
        sa.Column("income_proof", sa.String(500)),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("eligible", sa.Boolean(), nullable=False),
        sa.Column("assigned_officer", sa.String(160)),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "complaints",
        sa.Column("complaint_id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.user_id")),
        sa.Column("complaint_type", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("district", sa.String(100), nullable=False),
        sa.Column("taluk", sa.String(100)),
        sa.Column("routed_authority", sa.String(180), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("uploaded_documents", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "directory_services",
        sa.Column("service_id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("service_type", sa.String(80), nullable=False),
        sa.Column("district", sa.String(100), nullable=False),
        sa.Column("taluk", sa.String(100)),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("phone", sa.String(32)),
        sa.Column("latitude", sa.Float()),
        sa.Column("longitude", sa.Float()),
    )
    op.create_table(
        "notifications",
        sa.Column("notification_id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.user_id")),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("channel", sa.String(40), nullable=False),
        sa.Column("read_status", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "audit_logs",
        sa.Column("log_id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid()),
        sa.Column("action", sa.String(180), nullable=False),
        sa.Column("ip_address", sa.String(80)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    for table in [
        "audit_logs",
        "notifications",
        "directory_services",
        "complaints",
        "dlsa_applications",
        "generated_documents",
        "precedent_store",
        "legal_statutes",
        "case_objects",
        "legal_queries",
        "users",
    ]:
        op.drop_table(table)
