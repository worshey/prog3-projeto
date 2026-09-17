from pydantic import BaseModel, ConfigDict, Field


class PizzaCriar(BaseModel):        # ENTRA no cadastro
    nome: str = Field(min_length=2)
    preco: float = Field(gt=0)
    disponivel: bool = True


class PizzaPublica(BaseModel):      # SAI na resposta
    # A novidade do encontro 4: sem esta linha o Pydantic so' aceita
    # dicionario, e agora quem chega e' um objeto do SQLAlchemy.
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    preco: float
    disponivel: bool


class PizzaAtualizar(BaseModel):    # ENTRA na edicao, tudo opcional
    nome: str | None = None
    preco: float | None = Field(default=None, gt=0)
    disponivel: bool | None = None
