from typing import Annotated
from uuid import UUID
import sys

from app.database.database import get_db
from app.models.models import Alternativa, Pergunta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/teste",
    tags=["teste"],
    responses={404: {"description": "Not found"}},
)


@router.post("/importar/{tema_id}/{fase_id}")
async def importar_perguntas_teste(
    tema_id: UUID,
    fase_id: UUID,
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        # Criar dados de teste
        dados_teste = {
            "perguntas": [
                {
                    "pergunta": "Pergunta de teste 1",
                    "alternativas": [
                        {"texto": "Alternativa 1", "correta": True, "letra": "A"},
                        {"texto": "Alternativa 2", "correta": False, "letra": "B"},
                    ]
                }
            ]
        }
        
        sys.stdout.write(f"DADOS DE TESTE: {dados_teste}\n")
        sys.stdout.flush()
        
        perguntas_count = 0
        alternativas_count = 0
        
        # Processar cada pergunta diretamente
        for p in dados_teste["perguntas"]:
            # Criar a pergunta
            nova_pergunta = Pergunta(
                texto=p["pergunta"], 
                fase_id=fase_id, 
                user_id=user_id
            )
            db.add(nova_pergunta)
            db.flush()
            perguntas_count += 1
            
            # Processar alternativas
            for i, alt in enumerate(p["alternativas"]):
                # Criar alternativa
                nova_alternativa = Alternativa(
                    texto=alt["texto"],
                    correta=alt["correta"],
                    letra=alt["letra"],
                    pergunta_id=nova_pergunta.id,
                    user_id=user_id,
                )
                db.add(nova_alternativa)
                alternativas_count += 1
        
        db.commit()
        sys.stdout.write(f"SUCESSO TESTE: {perguntas_count} perguntas e {alternativas_count} alternativas importadas\n")
        sys.stdout.flush()
        
        return {
            "mensagem": "Perguntas e alternativas de teste importadas com sucesso!",
            "perguntas_importadas": perguntas_count,
            "alternativas_importadas": alternativas_count,
        }
            
    except Exception as e:
        sys.stdout.write(f"ERRO GERAL TESTE: {str(e)}\n")
        sys.stdout.flush()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar perguntas de teste: {str(e)}",
        ) 