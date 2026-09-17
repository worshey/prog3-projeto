from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .database import Base, engine
from .pizzas import controller as pizzas_controller
from .pizzas.erros import ErroDePizza, PizzaNaoEncontrada
from .usuarios import controller as usuarios_controller
from .usuarios.erros import CredenciaisInvalidas, ErroDeUsuario

# So' para a aula: cria as tabelas ao subir. Em projeto de verdade quem
# faz isso e' uma ferramenta de migracao (Alembic), assunto de outro dia.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API MaisMassa", version="0.4.0")
app.include_router(pizzas_controller.router)
app.include_router(usuarios_controller.router)


@app.exception_handler(ErroDePizza)
def traduzir_recusa_pizza(request: Request, erro: ErroDePizza):
    """Recusas do cardapio viram HTTP aqui, e so' aqui."""
    codigo = 404 if isinstance(erro, PizzaNaoEncontrada) else 409
    return JSONResponse(status_code=codigo, content={"detail": str(erro)})


@app.exception_handler(ErroDeUsuario)
def traduzir_recusa_usuario(request: Request, erro: ErroDeUsuario):
    """Recusas de conta viram HTTP aqui, e so' aqui."""
    codigo = 401 if isinstance(erro, CredenciaisInvalidas) else 409
    return JSONResponse(status_code=codigo, content={"detail": str(erro)})
