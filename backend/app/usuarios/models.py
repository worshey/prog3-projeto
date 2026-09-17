from sqlalchemy import Column, Integer, String

from ..database import Base


class Usuario(Base):
    """A conta que faz login. Nunca guarda a senha, so' o hash dela."""

    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
