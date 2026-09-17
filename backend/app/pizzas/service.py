"""As regras do cardapio, e mais nada.

Este arquivo decide. Ele nao levanta erro de protocolo, nao monta consulta
e nao abre conexao: quem fala HTTP e o controller, quem fala SQL e o
repository. Um dia essas regras podem ser chamadas por um script de
importacao, sem requisicao nenhuma para responder -- e vao funcionar.

O `db` atravessa este arquivo sem ser aberto: o Service so o repassa para
o repository, que e quem sabe o que fazer com ele.
"""
from . import repository
from .erros import (
    CampoNaoEditavel,
    NomeJaCadastrado,
    PizzaIndisponivel,
    PizzaNaoEncontrada,
)

RN02_PROIBIDO = "disponivel"   # quem controla estoque e o estoque, nao o cardapio


def listar(db):
    return repository.listar(db)


def buscar(db, pizza_id):
    pizza = repository.buscar(db, pizza_id)
    if pizza is None:
        raise PizzaNaoEncontrada(f"Pizza {pizza_id} nao esta no cardapio")
    return pizza


def criar(db, dados):
    # RN01: o mesmo nome nao entra duas vezes no cardapio.
    if repository.buscar_por_nome(db, dados["nome"]):
        raise NomeJaCadastrado(f"Ja existe uma pizza chamada {dados['nome']}")
    return repository.criar(db, dados)


def atualizar(db, pizza_id, mudancas):
    pizza = buscar(db, pizza_id)

    novo_nome = mudancas.get("nome")
    if novo_nome and novo_nome != pizza.nome:
        if repository.buscar_por_nome(db, novo_nome):
            raise NomeJaCadastrado(f"Ja existe uma pizza chamada {novo_nome}")

    if RN02_PROIBIDO in mudancas:
        raise CampoNaoEditavel("disponivel nao se edita pelo cardapio")

    return repository.atualizar(db, pizza, mudancas)


def apagar(db, pizza_id):
    pizza = buscar(db, pizza_id)
    # RN03: pizza fora de estoque nao some do cardapio, so' fica oculta.
    if not pizza.disponivel:
        raise PizzaIndisponivel(f"Pizza {pizza_id} esta fora de estoque")
    repository.apagar(db, pizza)
