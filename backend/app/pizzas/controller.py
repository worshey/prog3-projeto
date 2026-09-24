from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..auth.security import get_current_user
from ..database import get_db
from ..usuarios.models import Usuario
from . import service
from .schemas import PizzaAtualizar, PizzaCriar, PizzaPublica

router = APIRouter(prefix="/pizzas", tags=["Pizzas"])

# Nenhum `if` de regra e nenhum `try` aqui: as recusas do Service viram
# HTTP no tradutor registrado no main.py, uma vez para todas as rotas.
#
# `usuario` aqui NAO e' so' para forcar a autenticacao: e' quem entra
# como dono na criacao e quem filtra a listagem - cada conta so' ve e
# mexe no proprio cardapio.


@router.get("/", response_model=list[PizzaPublica])
def listar(
    nome: str | None = Query(
        default=None,
        description="Filtra pelo nome da pizza (busca parcial, sem diferenciar maiusculas)",
    ),
    disponivel: bool | None = Query(
        default=None,
        description="Filtra por disponibilidade (true ou false)",
    ),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.listar(db, usuario.id, nome=nome, disponivel=disponivel)


@router.post("/", response_model=PizzaPublica, status_code=201)
def criar(
    dados: PizzaCriar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.criar(db, dados.model_dump(), usuario.id)


@router.get("/{pizza_id}", response_model=PizzaPublica)
def buscar(
    pizza_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.buscar(db, pizza_id, usuario.id)


@router.patch("/{pizza_id}", response_model=PizzaPublica)
def atualizar(
    pizza_id: int,
    dados: PizzaAtualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return service.atualizar(
        db, pizza_id, dados.model_dump(exclude_unset=True), usuario.id
    )


@router.delete("/{pizza_id}", status_code=204)
def apagar(
    pizza_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    service.apagar(db, pizza_id, usuario.id)
