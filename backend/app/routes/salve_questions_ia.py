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
    prefix="/importar",
    tags=["importar"],
    responses={404: {"description": "Not found"}},
)


@router.post("/{tema_id}/{fase_id}", response_model=RespostaPerguntasImportadas)
async def importar_perguntas(
    tema_id: UUID,
    fase_id: UUID,
    user_id: UUID,
    dados: ImportarPerguntasSchema,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        perguntas_count = 0
        alternativas_count = 0

        # Processa cada pergunta no JSON
        for p in dados.perguntas:
            # Cria a pergunta no banco de dados
            nova_pergunta = Pergunta(texto=p.pergunta, fase_id=fase_id, user_id=user_id)
            db.add(nova_pergunta)
            db.flush()  # Necessário para obter o ID da pergunta

            perguntas_count += 1

            # Processa as alternativas da pergunta
            for alt in p.alternativas:
                nova_alternativa = Alternativa(
                    texto=alt.texto,
                    correta=alt.correta,
                    pergunta_id=nova_pergunta.id,
                    user_id=user_id,
                )
                db.add(nova_alternativa)
                alternativas_count += 1

        db.commit()

        return RespostaPerguntasImportadas(
            mensagem="Perguntas e alternativas importadas com sucesso!",
            perguntas_importadas=perguntas_count,
            alternativas_importadas=alternativas_count,
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar perguntas: {str(e)}",
        )
