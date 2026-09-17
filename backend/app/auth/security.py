"""Autenticacao: hash de senha e emissao/leitura do token JWT.

Este arquivo e' infraestrutura de seguranca, nao regra de negocio - por
isso, diferente do service.py das entidades, ele pode falar com o
FastAPI diretamente (OAuth2PasswordBearer, HTTPException). Quem decide
se um cadastro ou um login sao validos continua sendo o service de
usuarios; aqui so' se hashea senha e se emite/confere token.
"""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database import get_db
from ..usuarios import repository as usuarios_repository
from ..usuarios.models import Usuario

# Sem valor padrao de proposito: faltando a variavel, a aplicacao nao
# sobe assinando token com uma chave qualquer.
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITMO = "HS256"
MINUTOS_DE_VALIDADE = 60

# tokenUrl e' so' o endereco que o Swagger usa para pedir o token no
# botao "Authorize" - a rota de fato continua registrada no controller.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_senha(senha: str) -> str:
    """Nunca guardamos a senha, so' o hash. bcrypt ja' embute o salt."""
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))


def criar_token(email: str) -> str:
    expira_em = datetime.now(timezone.utc) + timedelta(minutes=MINUTOS_DE_VALIDADE)
    payload = {"sub": email, "exp": expira_em}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITMO)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """Dependencia que protege as rotas. Sem token valido, 401.

    Esta e' a unica excecao a regra "service nao levanta HTTPException":
    aqui nao existe uma regra de negocio sendo violada, existe um pedido
    que ainda nao provou quem esta' fazendo ele - e' o proprio FastAPI
    quem resolve isso via Security/Depends, entao 401 e' levantado no
    nivel da dependencia, antes de qualquer service ser chamado.
    """
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nao foi possivel validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITMO])
        email = payload.get("sub")
        if email is None:
            raise credenciais_invalidas
    except jwt.PyJWTError:
        raise credenciais_invalidas

    usuario = usuarios_repository.buscar_por_email(db, email)
    if usuario is None:
        raise credenciais_invalidas
    return usuario
