from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from . import service
from .schemas import TokenResponse, UsuarioCriar, UsuarioPublico

router = APIRouter(tags=["Usuarios"])

# Nenhum `if` de regra aqui: quem decide e' o service, quem vira HTTP
# em caso de recusa e' o tradutor registrado no main.py.


@router.post("/usuarios/", response_model=UsuarioPublico, status_code=201)
def registrar(dados: UsuarioCriar, db: Session = Depends(get_db)):
    return service.registrar(db, dados.model_dump())


@router.post("/auth/login", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # OAuth2PasswordRequestForm chama o campo de "username", mas aqui
    # quem entra nele e' o email - e' o formato que o botao
    # "Authorize" do Swagger espera para testar o fluxo inteiro.
    token = service.autenticar(db, form.username, form.password)
    return TokenResponse(access_token=token)
