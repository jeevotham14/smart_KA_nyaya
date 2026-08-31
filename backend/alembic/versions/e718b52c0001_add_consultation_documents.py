"""add_consultation_documents

Revision ID: e718b52c0001
Revises: a33e08819f61
Create Date: 2026-08-31 11:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e718b52c0001'
down_revision: Union[str, None] = 'a33e08819f61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'consultation_documents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('appointment_id', sa.UUID(), nullable=False),
        sa.Column('uploaded_by_user_id', sa.UUID(), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('storage_key', sa.String(length=255), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('document_type', sa.String(length=60), server_default='OTHER', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['appointment_id'], ['consultation_appointments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by_user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_consultation_documents_appointment_id'), 'consultation_documents', ['appointment_id'], unique=False)
    op.create_index(op.f('ix_consultation_documents_uploaded_by_user_id'), 'consultation_documents', ['uploaded_by_user_id'], unique=False)
    op.create_index(op.f('ix_consultation_documents_storage_key'), 'consultation_documents', ['storage_key'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_consultation_documents_storage_key'), table_name='consultation_documents')
    op.drop_index(op.f('ix_consultation_documents_uploaded_by_user_id'), table_name='consultation_documents')
    op.drop_index(op.f('ix_consultation_documents_appointment_id'), table_name='consultation_documents')
    op.drop_table('consultation_documents')
