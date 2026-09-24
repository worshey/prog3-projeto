from sqlalchemy.orm import Session

from .models import Pizza

# A UNICA parte do sistema que sabe que existe um banco. Se aparecer um
# `db.query` fora daqui, a camada vazou.
#
# Todo mundo aqui recebe `usuario_id` e filtra por ele: o cardapio e'
# por conta, ninguem ve ou mexe na pizza de outro usuario so' por
# adivinhar o id na URL.


def listar(db: Session, usuario_id: int, nome: str | None = None, disponivel: bool | None = None):
    consulta = db.query(Pizza).filter(Pizza.usuario_id == usuario_id)
    if nome:
        # ilike = case-insensitive e por substring: "muça" acha "Muçarela".
        consulta = consulta.filter(Pizza.nome.ilike(f"%{nome}%"))
    if disponivel is not None:
        consulta = consulta.filter(Pizza.disponivel == disponivel)
    return consulta.order_by(Pizza.nome).all()


def buscar(db: Session, pizza_id: int, usuario_id: int):
    return (
        db.query(Pizza)
        .filter(Pizza.id == pizza_id, Pizza.usuario_id == usuario_id)
        .first()
    )


def criar(db: Session, dados: dict):
    pizza = Pizza(**dados)
    db.add(pizza)
    db.commit()
    db.refresh(pizza)   # o id nasce no banco; sem isto ele vem None
    return pizza


def buscar_por_nome(db: Session, nome: str, usuario_id: int):
    return (
        db.query(Pizza)
        .filter(Pizza.nome == nome, Pizza.usuario_id == usuario_id)
        .first()
    )


def atualizar(db: Session, pizza: Pizza, mudancas: dict):
    for campo, valor in mudancas.items():
        setattr(pizza, campo, valor)
    db.commit()
    db.refresh(pizza)
    return pizza


def apagar(db: Session, pizza: Pizza):
    db.delete(pizza)
    db.commit()
