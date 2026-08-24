"""add_selected_advocate_id_to_broadcast

Revision ID: 4000c5d50f32
Revises: 288ded1702fd
Create Date: 2026-08-24 10:55:45.612644

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4000c5d50f32'
down_revision: Union[str, None] = '288ded1702fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('consultation_broadcasts', sa.Column('selected_advocate_id', sa.Uuid(), nullable=True))


def downgrade() -> None:
    op.drop_column('consultation_broadcasts', 'selected_advocate_id')
