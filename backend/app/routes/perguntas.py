import uuid
from typing import List

from app.database.database import get_db
from app.models.models import Alternativa, Fase, Pergunta
from app.schemas.schemas import PerguntaCreate, PerguntaOut, PerguntaWithAlternativas
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/perguntas",
    tags=["perguntas"],
)


@router.post("/", response_model=PerguntaOut, status_code=status.HTTP_201_CREATED)
def create_pergunta(
    pergunta: PerguntaCreate, fase_id: uuid.UUID, db: Session = Depends(get_db)
):
    # Verificar se a fase existe
    fase = db.query(Fase).filter(Fase.id == fase_id).first()
    if fase is None:
        raise HTTPException(status_code=404, detail="Fase não encontrada")

    # Verificar se o usuário é dono da fase
    if str(fase.user_id) != str(pergunta.user_id):
        raise HTTPException(
            status_code=403, detail="Usuário não tem permissão para esta fase"
        )

    db_pergunta = Pergunta(
        texto=pergunta.texto, fase_id=fase_id, user_id=pergunta.user_id
    )
    db.add(db_pergunta)
    db.commit()
    db.refresh(db_pergunta)
    return db_pergunta


@router.post(
    "/with-alternativas/",
    response_model=PerguntaOut,
    status_code=status.HTTP_201_CREATED,
)
def create_pergunta_with_alternativas(
    pergunta: PerguntaWithAlternativas,
    fase_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    # Verificar se a fase existe
    fase = db.query(Fase).filter(Fase.id == fase_id).first()
    if fase is None:
        raise HTTPException(status_code=404, detail="Fase não encontrada")

    # Verificar se o usuário é dono da fase
    if str(fase.user_id) != str(pergunta.user_id):
        raise HTTPException(
            status_code=403, detail="Usuário não tem permissão para esta fase"
        )

    # Criar a pergunta
    db_pergunta = Pergunta(
        texto=pergunta.texto, fase_id=fase_id, user_id=pergunta.user_id
    )
    db.add(db_pergunta)
    db.commit()
    db.refresh(db_pergunta)

    # Criar as alternativas
    for alt in pergunta.alternativas:
        db_alt = Alternativa(
            texto=alt.texto,
            correta=alt.correta,
            pergunta_id=db_pergunta.id,
            user_id=pergunta.user_id,
        )
        db.add(db_alt)

    db.commit()
    db.refresh(db_pergunta)
    return db_pergunta


@router.get("/fase/{fase_id}", response_model=List[PerguntaOut])
def read_perguntas_by_fase(fase_id: uuid.UUID, db: Session = Depends(get_db)):
    perguntas = db.query(Pergunta).filter(Pergunta.fase_id == fase_id).all()
    return perguntas


@router.get("/{pergunta_id}", response_model=PerguntaOut)
def read_pergunta(pergunta_id: uuid.UUID, db: Session = Depends(get_db)):
    pergunta = db.query(Pergunta).filter(Pergunta.id == pergunta_id).first()
    if pergunta is None:
        raise HTTPException(status_code=404, detail="Pergunta não encontrada")
    return pergunta
