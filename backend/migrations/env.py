"""Liga o Alembic aos models do projeto.

Duas coisas nao-obvias acontecem aqui:
1. A URL do banco vem do MESMO .env que o app/database.py usa - um so'
   lugar decide qual banco esta' em uso, nunca dois.
2. Os models precisam ser IMPORTADOS (mesmo sem uso direto) para o
   SQLAlchemy registrar as tabelas em Base.metadata antes do Alembic
   comparar/gerar qualquer coisa.
"""
import os
import sys
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

# Permite `from app...` mesmo rodando o Alembic a partir de backend/.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base  # noqa: E402
from app.pizzas.models import Pizza  # noqa: E402,F401
from app.usuarios.models import Usuario  # noqa: E402,F401

load_dotenv()

config = context.config
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Gera o SQL sem abrir conexao (`alembic upgrade head --sql`)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Modo normal: abre conexao de verdade e aplica as migracoes."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
