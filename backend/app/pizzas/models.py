from sqlalchemy import Boolean, Column, Float, Integer, String

from ..database import Base


class Pizza(Base):
    """A TABELA. Nao confunda com os schemas: aquilo atravessa a
    fronteira da API, isto vira linha no banco.
    """

    __tablename__ = "pizzas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    preco = Column(Float, nullable=False)
    disponivel = Column(Boolean, nullable=False, default=True)
