"""add_fks_for_broadcasts

Revision ID: a33e08819f61
Revises: f1cf9d68bf60
Create Date: 2026-08-24 11:10:35.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a33e08819f61'
down_revision: Union[str, None] = 'f1cf9d68bf60'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.batch_alter_table('consultation_broadcasts') as batch_op:
        batch_op.create_foreign_key('fk_broadcast_selected_advocate', 'advocate_profiles', ['selected_advocate_id'], ['id'], ondelete='SET NULL')
    
    with op.batch_alter_table('consultation_appointments') as batch_op:
        batch_op.create_foreign_key('fk_appointment_broadcast', 'consultation_broadcasts', ['broadcast_id'], ['id'], ondelete='SET NULL')

def downgrade() -> None:
    with op.batch_alter_table('consultation_appointments') as batch_op:
        batch_op.drop_constraint('fk_appointment_broadcast', type_='foreignkey')
        
    with op.batch_alter_table('consultation_broadcasts') as batch_op:
        batch_op.drop_constraint('fk_broadcast_selected_advocate', type_='foreignkey')
