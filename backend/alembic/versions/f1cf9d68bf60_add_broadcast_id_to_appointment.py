"""add_broadcast_id_to_appointment

Revision ID: f1cf9d68bf60
Revises: 4000c5d50f32
Create Date: 2026-08-24 11:07:02.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f1cf9d68bf60'
down_revision: Union[str, None] = '4000c5d50f32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('consultation_appointments', sa.Column('broadcast_id', sa.Uuid(), nullable=True))
    with op.batch_alter_table('consultation_appointments') as batch_op:
        batch_op.create_unique_constraint('uq_appointment_broadcast', ['broadcast_id'])

def downgrade() -> None:
    with op.batch_alter_table('consultation_appointments') as batch_op:
        batch_op.drop_constraint('uq_appointment_broadcast', type_='unique')
    op.drop_column('consultation_appointments', 'broadcast_id')
