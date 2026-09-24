from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

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

    # O lado "muitos" do um-para-muitos: toda pizza pertence a quem a
    # cadastrou, e nao existe pizza sem dono (nullable=False). Esta
    # coluna nao nasceu com `create_all` - ela entrou pela migracao
    # Alembic 0002 (veja migrations/versions/).
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    usuario = relationship("Usuario", back_populates="pizzas")
