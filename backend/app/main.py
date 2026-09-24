"""Ponto de entrada da API MaisMassa.

Aqui, e somente aqui, moram duas coisas que nao sao regra de negocio:
o cadastro das rotas de cada modulo e o tradutor que converte cada
recusa do dominio (ErroDePizza, ErroDeUsuario) em uma resposta HTTP de
verdade. Nenhum service levanta HTTPException - ele levanta um erro do
seu proprio dominio, e e' aqui que esse erro ganha um codigo HTTP.

O schema do banco NAO nasce daqui (nada de Base.metadata.create_all).
Quem cria e altera tabelas e' o Alembic (`alembic upgrade head`, rodado
antes de subir a API) - e' o que permite trocar o DATABASE_URL para
Postgres sem tocar em nenhum arquivo dentro de app/.
"""
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .pizzas.controller import router as pizzas_router
from .pizzas.erros import (
    CampoNaoEditavel,
    ErroDePizza,
    NomeJaCadastrado,
    PizzaIndisponivel,
    PizzaNaoEncontrada,
)
from .usuarios.controller import router as usuarios_router
from .usuarios.erros import CredenciaisInvalidas, EmailJaCadastrado, ErroDeUsuario

app = FastAPI(
    title="MaisMassa",
    description="API de gestao de pizzaria - cada conta tem o proprio cardapio.",
    version="0.3.0",
)

app.include_router(usuarios_router)
app.include_router(pizzas_router)


# Cada recusa do dominio vira um HTTP especifico. Mapeamento explicito
# em vez de um atributo "status_code" na propria excecao para manter
# erros.py livre de qualquer rastro de HTTP - ele so' descreve o que
# deu errado no cardapio ou na conta, nunca como isso vira protocolo.
_STATUS_PIZZA = {
    PizzaNaoEncontrada: status.HTTP_404_NOT_FOUND,
    NomeJaCadastrado: status.HTTP_409_CONFLICT,
    CampoNaoEditavel: status.HTTP_409_CONFLICT,
    PizzaIndisponivel: status.HTTP_409_CONFLICT,
}

_STATUS_USUARIO = {
    EmailJaCadastrado: status.HTTP_409_CONFLICT,
    CredenciaisInvalidas: status.HTTP_401_UNAUTHORIZED,
}


@app.exception_handler(ErroDePizza)
def tratar_erro_de_pizza(request: Request, exc: ErroDePizza) -> JSONResponse:
    codigo = _STATUS_PIZZA.get(type(exc), status.HTTP_400_BAD_REQUEST)
    return JSONResponse(status_code=codigo, content={"detail": str(exc)})


@app.exception_handler(ErroDeUsuario)
def tratar_erro_de_usuario(request: Request, exc: ErroDeUsuario) -> JSONResponse:
    codigo = _STATUS_USUARIO.get(type(exc), status.HTTP_400_BAD_REQUEST)
    headers = {"WWW-Authenticate": "Bearer"} if codigo == status.HTTP_401_UNAUTHORIZED else None
    return JSONResponse(status_code=codigo, content={"detail": str(exc)}, headers=headers)


@app.exception_handler(RequestValidationError)
def tratar_erro_de_validacao(request: Request, exc: RequestValidationError) -> JSONResponse:
    """O Pydantic ja' explica o que esta' errado - aqui so' reorganizamos
    a lista de erros interna do FastAPI (com "loc", "msg", "type"...) em
    algo direto de ler: uma lista de {campo, mensagem}.
    """
    prefixos = {"body", "query", "path"}
    erros = [
        {
            "campo": ".".join(str(parte) for parte in erro["loc"] if parte not in prefixos) or None,
            "mensagem": erro["msg"],
        }
        for erro in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": erros},
    )


@app.get("/", tags=["Status"])
def raiz():
    return {"status": "ok", "servico": "MaisMassa"}
