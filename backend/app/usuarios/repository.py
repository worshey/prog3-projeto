from sqlalchemy.orm import Session

from .models import Usuario

# A UNICA parte do sistema que sabe que existe um banco para usuarios.
# Se aparecer um `db.query` fora daqui, a camada vazou.


def buscar_por_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()


def criar(db: Session, email: str, senha_hash: str):
    usuario = Usuario(email=email, senha_hash=senha_hash)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario
