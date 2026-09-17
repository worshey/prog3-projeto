class ErroDePizza(Exception):
    """Qualquer recusa do cardapio. Quem traduz para HTTP e o main.py."""


class PizzaNaoEncontrada(ErroDePizza):
    """Pediram uma pizza que nao esta no cardapio."""


class NomeJaCadastrado(ErroDePizza):
    """Ja existe uma pizza com esse nome no cardapio."""


class CampoNaoEditavel(ErroDePizza):
    """Tentaram editar pelo cardapio um campo que nao e do cardapio."""


class PizzaIndisponivel(ErroDePizza):
    """Nao se apaga do cardapio uma pizza que esta fora de estoque."""
