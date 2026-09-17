from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCriar(BaseModel):       # ENTRA no cadastro
    email: EmailStr
    senha: str = Field(min_length=8)


class UsuarioPublico(BaseModel):     # SAI na resposta - sem senha, nunca
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr


class TokenResponse(BaseModel):      # SAI no login
    access_token: str
    token_type: str = "bearer"
