from sqlalchemy.orm import Session

from .models import Usuario

# A UNICA parte do modulo de contas que sabe que existe um banco -
# mesma convencao do repository de pizzas.


def buscar_por_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()


def buscar_por_id(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def criar(db: Session, email: str, senha_hash: str):
    usuario = Usuario(email=email, senha_hash=senha_hash)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)   # o id nasce no banco; sem isto ele vem None
    return usuario
