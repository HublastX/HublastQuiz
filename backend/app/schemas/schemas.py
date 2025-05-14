from typing import List, Optional

from pydantic import UUID4, BaseModel, Field, validator


# Esquemas base (para criação)
class AlternativaBase(BaseModel):
    texto: str
    correta: bool = False
    user_id: UUID4


class AlternativaCreate(AlternativaBase):
    pass


class PerguntaBase(BaseModel):
    texto: str
    user_id: UUID4


class PerguntaCreate(PerguntaBase):
    pass


class FaseBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    ordem: int
    user_id: UUID4


class FaseCreate(FaseBase):
    pass


class TemaBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    user_id: UUID4


class TemaCreate(TemaBase):
    pass


# Esquemas para leitura (resposta)
class AlternativaOut(BaseModel):
    id: UUID4
    texto: str
    correta: bool
    pergunta_id: UUID4

    class Config:
        orm_mode = True


class PerguntaOut(BaseModel):
    id: UUID4
    texto: str
    fase_id: UUID4
    alternativas: List[AlternativaOut] = []

    class Config:
        orm_mode = True


class FaseOut(BaseModel):
    id: UUID4
    titulo: str
    descricao: Optional[str]
    ordem: int
    tema_id: UUID4
    perguntas: List[PerguntaOut] = []

    class Config:
        orm_mode = True


class TemaOut(BaseModel):
    id: UUID4
    titulo: str
    descricao: Optional[str]
    fases: List[FaseOut] = []

    class Config:
        orm_mode = True


# Esquema para criação de alternativa dentro de uma pergunta
class AlternativaInPergunta(BaseModel):
    texto: str
    correta: bool = False


class PerguntaWithAlternativas(PerguntaBase):
    alternativas: List[AlternativaInPergunta] = Field(
        default_factory=list, max_length=4
    )

    @validator("alternativas")
    def validate_alternativas(cls, v):
        if len(v) > 4:
            raise ValueError("Uma pergunta pode ter no máximo 4 alternativas")
        return v
