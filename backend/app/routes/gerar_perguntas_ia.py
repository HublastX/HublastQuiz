from typing import Annotated
from uuid import UUID

from app.database.database import get_db
from app.models.models import Alternativa, Pergunta
from app.schemas.pdf_ia import (
    ImportarPerguntasSchema,
    RespostaPerguntasImportadas,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    tags=["ia"],
    responses={404: {"description": "Not found"}},
)


@router.post("/gerar-perguntas", response_model=RespostaPerguntasImportadas)
async def gerar_perguntas_ia(
    user_id: UUID,
    dados: dict,  # Contém prompt, tema_id, fase_id
    db: Annotated[Session, Depends(get_db)],
):
    try:
        # Aqui você implementaria a chamada para o serviço de IA
        # Por enquanto, vamos simular uma resposta para resolver o erro 422
        
        # Simulação de perguntas geradas por IA
        perguntas_simuladas = {
            "perguntas": [
                {
                    "pergunta": "O que é um algoritmo?",
                    "alternativas": [
                        {"letra": "A", "texto": "Um tipo de hardware", "correta": False},
                        {"letra": "B", "texto": "Um conjunto de instruções para resolver um problema", "correta": True},
                        {"letra": "C", "texto": "Um sistema operacional", "correta": False},
                        {"letra": "D", "texto": "Um tipo de linguagem de programação", "correta": False}
                    ]
                }
            ]
        }
        
        perguntas_count = 0
        alternativas_count = 0
        
        # Processar as perguntas simuladas
        for p in perguntas_simuladas["perguntas"]:
            # Criar a pergunta no banco de dados
            nova_pergunta = Pergunta(
                texto=p["pergunta"], 
                fase_id=dados["fase_id"], 
                user_id=user_id
            )
            db.add(nova_pergunta)
            db.flush()  # Necessário para obter o ID da pergunta
            
            perguntas_count += 1
            
            # Processar as alternativas
            for alt in p["alternativas"]:
                nova_alternativa = Alternativa(
                    texto=alt["texto"],
                    correta=alt["correta"],
                    pergunta_id=nova_pergunta.id,
                    user_id=user_id,
                )
                db.add(nova_alternativa)
                alternativas_count += 1
        
        db.commit()
        
        return RespostaPerguntasImportadas(
            mensagem="Perguntas e alternativas geradas com sucesso!",
            perguntas_importadas=perguntas_count,
            alternativas_importadas=alternativas_count,
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar perguntas: {str(e)}",
        ) 