from typing import List, Optional, Union

from pydantic import BaseModel, Field


class AlternativaImport(BaseModel):
    texto: str
    correta: bool
    letra: Optional[str] = None
    explicacao: Optional[str] = None


class PerguntaImport(BaseModel):
    pergunta: str = ""
    texto: str = ""
    alternativas: List[AlternativaImport]
    
    def __init__(self, **data):
        # Se 'texto' estiver presente mas 'pergunta' não, use 'texto' como 'pergunta'
        if 'texto' in data and not data.get('pergunta'):
            data['pergunta'] = data['texto']
        # Se 'pergunta' estiver presente mas 'texto' não, use 'pergunta' como 'texto'
        elif 'pergunta' in data and not data.get('texto'):
            data['texto'] = data['pergunta']
        super().__init__(**data)


class ImportarPerguntasSchema(BaseModel):
    perguntas: List[PerguntaImport]


class RespostaPerguntasImportadas(BaseModel):
    mensagem: str
    perguntas_importadas: int
    alternativas_importadas: int
