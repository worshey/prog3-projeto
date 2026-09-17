from sqlalchemy.orm import Session

from .models import Pizza

# A UNICA parte do sistema que sabe que existe um banco. Se aparecer um
# `db.query` fora daqui, a camada vazou.


def listar(db: Session):
    return db.query(Pizza).all()


def buscar(db: Session, pizza_id: int):
    return db.query(Pizza).filter(Pizza.id == pizza_id).first()


def criar(db: Session, dados: dict):
    pizza = Pizza(**dados)
    db.add(pizza)
    db.commit()
    db.refresh(pizza)   # o id nasce no banco; sem isto ele vem None
    return pizza


def buscar_por_nome(db: Session, nome: str):
    return db.query(Pizza).filter(Pizza.nome == nome).first()


def atualizar(db: Session, pizza: Pizza, mudancas: dict):
    for campo, valor in mudancas.items():
        setattr(pizza, campo, valor)
    db.commit()
    db.refresh(pizza)
    return pizza


def apagar(db: Session, pizza: Pizza):
    db.delete(pizza)
    db.commit()
