from typing import List, Optional

from pydantic import BaseModel


class AlternativaImport(BaseModel):
    letra: str
    texto: str
    correta: bool
    explicacao: Optional[str] = None


class PerguntaImport(BaseModel):
    pergunta: str
    alternativas: List[AlternativaImport]


class ImportarPerguntasSchema(BaseModel):
    perguntas: List[PerguntaImport]


class RespostaPerguntasImportadas(BaseModel):
    mensagem: str
    perguntas_importadas: int
    alternativas_importadas: int
