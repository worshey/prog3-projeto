"""adiciona o relacionamento pizza -> usuario (FK usuario_id)

Este e' o migration que representa a mudanca de modelo: o cardapio
deixa de ser global e passa a pertencer a uma conta. A coluna nao
nasce de um `Base.metadata.create_all()` (isso so' cria tabela que nao
existe, nunca altera uma que ja existe) - ela nasce aqui, de um jeito
que funciona tanto rodando pela primeira vez quanto em cima de um
banco que ja estava no ar com a versao anterior do cardapio.

`batch_alter_table` existe por causa do SQLite: ele nao suporta ADD
COLUMN ... REFERENCES nem ADD CONSTRAINT diretamente, entao o Alembic
recria a tabela por baixo dos panos quando o dialeto e' SQLite. No
Postgres, o mesmo codigo vira um ALTER TABLE de verdade, sem recriar
nada - e' o motivo de rodar exatamente a mesma migracao nos dois
bancos sem precisar de um script para cada.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("pizzas") as batch_op:
        batch_op.add_column(sa.Column("usuario_id", sa.Integer(), nullable=False))
        batch_op.create_index("ix_pizzas_usuario_id", ["usuario_id"])
        batch_op.create_foreign_key(
            "fk_pizzas_usuario_id_usuarios",
            "usuarios",
            ["usuario_id"],
            ["id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("pizzas") as batch_op:
        batch_op.drop_constraint("fk_pizzas_usuario_id_usuarios", type_="foreignkey")
        batch_op.drop_index("ix_pizzas_usuario_id")
        batch_op.drop_column("usuario_id")
