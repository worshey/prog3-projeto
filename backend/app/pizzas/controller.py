from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth.security import get_current_user
from ..database import get_db
from . import service
from .schemas import PizzaAtualizar, PizzaCriar, PizzaPublica

router = APIRouter(prefix="/pizzas", tags=["Pizzas"])

# Nenhum `if` de regra e nenhum `try` aqui: as recusas do Service viram
# HTTP no tradutor registrado no main.py, uma vez para todas as rotas.
#
# `usuario` aparece so' para forcar a autenticacao (Depends roda antes
# do corpo da funcao) - o valor em si nao e' usado pelo cardapio.


@router.get("/", response_model=list[PizzaPublica])
def listar(db: Session = Depends(get_db), usuario=Depends(get_current_user)):
    return service.listar(db)


@router.post("/", response_model=PizzaPublica, status_code=201)
def criar(
    dados: PizzaCriar,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    return service.criar(db, dados.model_dump())


@router.get("/{pizza_id}", response_model=PizzaPublica)
def buscar(
    pizza_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    return service.buscar(db, pizza_id)


@router.patch("/{pizza_id}", response_model=PizzaPublica)
def atualizar(
    pizza_id: int,
    dados: PizzaAtualizar,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    return service.atualizar(
        db, pizza_id, dados.model_dump(exclude_unset=True)
    )


@router.delete("/{pizza_id}", status_code=204)
def apagar(
    pizza_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    service.apagar(db, pizza_id)
