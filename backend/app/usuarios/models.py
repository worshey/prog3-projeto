from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Usuario(Base):
    """A TABELA de contas. Cada usuario e' dono de zero ou mais pizzas
    que ele mesmo cadastrou - este e' o lado "um" do relacionamento
    um-para-muitos com Pizza (o lado "muitos" mora em pizzas/models.py,
    na FK `usuario_id`).
    """

    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    senha_hash = Column(String(255), nullable=False)

    # back_populates espelha o `usuario` declarado em Pizza: mexer num
    # lado atualiza o outro em memoria, sem outra consulta ao banco.
    pizzas = relationship("Pizza", back_populates="usuario")
