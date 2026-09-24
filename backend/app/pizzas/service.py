"""As regras do cardapio, e mais nada.

Este arquivo decide. Ele nao levanta erro de protocolo, nao monta consulta
e nao abre conexao: quem fala HTTP e o controller, quem fala SQL e o
repository. Um dia essas regras podem ser chamadas por um script de
importacao, sem requisicao nenhuma para responder -- e vao funcionar.

O `db` atravessa este arquivo sem ser aberto: o Service so o repassa para
o repository, que e quem sabe o que fazer com ele.

Todo mundo aqui recebe `usuario_id` (de quem esta' logado) e repassa
para o repository: RN01 (nome unico) e' unica por conta - RN06 garante
que ninguem enxerga ou edita a pizza de outra conta.
"""
from . import repository
from .erros import (
    CampoNaoEditavel,
    NomeJaCadastrado,
    PizzaIndisponivel,
    PizzaNaoEncontrada,
)

RN02_PROIBIDO = "disponivel"   # quem controla estoque e o estoque, nao o cardapio


def listar(db, usuario_id, nome=None, disponivel=None):
    return repository.listar(db, usuario_id, nome=nome, disponivel=disponivel)


def buscar(db, pizza_id, usuario_id):
    pizza = repository.buscar(db, pizza_id, usuario_id)
    if pizza is None:
        # RN06: pizza inexistente e pizza de outro usuario dao a mesma
        # recusa - nao se entrega pista de que o id pertence a alguem.
        raise PizzaNaoEncontrada(f"Pizza {pizza_id} nao esta no cardapio")
    return pizza


def criar(db, dados, usuario_id):
    # RN01: o mesmo nome nao entra duas vezes no cardapio da MESMA conta.
    if repository.buscar_por_nome(db, dados["nome"], usuario_id):
        raise NomeJaCadastrado(f"Ja existe uma pizza chamada {dados['nome']}")
    dados_completos = {**dados, "usuario_id": usuario_id}
    return repository.criar(db, dados_completos)


def atualizar(db, pizza_id, mudancas, usuario_id):
    pizza = buscar(db, pizza_id, usuario_id)

    novo_nome = mudancas.get("nome")
    if novo_nome and novo_nome != pizza.nome:
        if repository.buscar_por_nome(db, novo_nome, usuario_id):
            raise NomeJaCadastrado(f"Ja existe uma pizza chamada {novo_nome}")

    if RN02_PROIBIDO in mudancas:
        raise CampoNaoEditavel("disponivel nao se edita pelo cardapio")

    return repository.atualizar(db, pizza, mudancas)


def apagar(db, pizza_id, usuario_id):
    pizza = buscar(db, pizza_id, usuario_id)
    # RN03: pizza fora de estoque nao some do cardapio, so' fica oculta.
    if not pizza.disponivel:
        raise PizzaIndisponivel(f"Pizza {pizza_id} esta fora de estoque")
    repository.apagar(db, pizza)
