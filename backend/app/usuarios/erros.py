class ErroDeUsuario(Exception):
    """Qualquer recusa de conta. Quem traduz para HTTP e' o main.py."""


class EmailJaCadastrado(ErroDeUsuario):
    """Ja existe uma conta com esse email."""


class CredenciaisInvalidas(ErroDeUsuario):
    """Email ou senha nao conferem no login."""
