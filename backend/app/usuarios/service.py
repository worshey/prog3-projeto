"""As regras de conta, e mais nada.

Igual ao service de pizzas: nao levanta HTTPException e nao monta
consulta. So' decide se o cadastro/login pode acontecer e delega o
resto para o repository (banco) e para o auth.security (hash e token).
"""
from ..auth.security import criar_token, hash_senha, verificar_senha
from . import repository
from .erros import CredenciaisInvalidas, EmailJaCadastrado


def registrar(db, dados: dict):
    # RN04: cada email abre uma unica conta.
    if repository.buscar_por_email(db, dados["email"]):
        raise EmailJaCadastrado(
            f"Ja existe uma conta com o email {dados['email']}"
        )
    senha_hash = hash_senha(dados["senha"])
    return repository.criar(db, dados["email"], senha_hash)


def autenticar(db, email: str, senha: str) -> str:
    # RN05: sem conta com esse email ou senha errada, a recusa e' a mesma
    # mensagem - nao se entrega pista sobre qual das duas falhou.
    usuario = repository.buscar_por_email(db, email)
    if usuario is None or not verificar_senha(senha, usuario.senha_hash):
        raise CredenciaisInvalidas("Email ou senha invalidos")
    return criar_token(usuario.email)
