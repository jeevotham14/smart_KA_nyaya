"""add_reschedule_fields

Revision ID: fdb35e75e9d6
Revises: a261bc2c0871
Create Date: 2026-08-24 10:15:57.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fdb35e75e9d6'
down_revision: Union[str, None] = 'a261bc2c0871'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('consultation_appointments', schema=None) as batch_op:
        batch_op.add_column(sa.Column('proposed_date', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('proposed_start_time', sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column('proposed_end_time', sa.String(length=10), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('consultation_appointments', schema=None) as batch_op:
        batch_op.drop_column('proposed_end_time')
        batch_op.drop_column('proposed_start_time')
        batch_op.drop_column('proposed_date')
