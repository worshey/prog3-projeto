from pydantic import BaseModel, ConfigDict, Field, field_validator


def _validar_nome(valor: str) -> str:
    """Regra compartilhada entre criar e atualizar: o Field ja' barra
    string curta demais, mas nao barra " " (dois espacos) passando por
    "nome com 2+ caracteres" tecnicamente valido - por isso o strip.
    """
    valor = valor.strip()
    if len(valor) < 2:
        raise ValueError("nome deve ter pelo menos 2 caracteres, sem contar espacos nas pontas")
    return valor


class PizzaCriar(BaseModel):        # ENTRA no cadastro
    nome: str = Field(min_length=2, max_length=120, description="Nome da pizza no cardapio")
    preco: float = Field(gt=0, description="Preco em reais, precisa ser maior que zero")
    disponivel: bool = True

    @field_validator("nome")
    @classmethod
    def nome_sem_espacos_nas_pontas(cls, valor: str) -> str:
        return _validar_nome(valor)


class PizzaPublica(BaseModel):      # SAI na resposta
    # A novidade do encontro 4: sem esta linha o Pydantic so' aceita
    # dicionario, e agora quem chega e' um objeto do SQLAlchemy.
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    preco: float
    disponivel: bool


class PizzaAtualizar(BaseModel):    # ENTRA na edicao, tudo opcional
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    preco: float | None = Field(default=None, gt=0)
    disponivel: bool | None = None

    @field_validator("nome")
    @classmethod
    def nome_sem_espacos_nas_pontas(cls, valor: str | None) -> str | None:
        if valor is None:
            return valor
        return _validar_nome(valor)
