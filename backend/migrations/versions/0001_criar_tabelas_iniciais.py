"""criar tabelas iniciais (usuarios e pizzas)

Revision ID: 0001
Revises:
Create Date: 2026-09-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("senha_hash", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_usuarios_id", "usuarios", ["id"])
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)

    op.create_table(
        "pizzas",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("preco", sa.Float(), nullable=False),
        sa.Column("disponivel", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_pizzas_id", "pizzas", ["id"])


def downgrade() -> None:
    op.drop_index("ix_pizzas_id", table_name="pizzas")
    op.drop_table("pizzas")

    op.drop_index("ix_usuarios_email", table_name="usuarios")
    op.drop_index("ix_usuarios_id", table_name="usuarios")
    op.drop_table("usuarios")
