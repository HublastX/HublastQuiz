import uuid
from typing import List

from app.database.database import get_db
from app.models.models import Alternativa, Pergunta
from app.schemas.schemas import AlternativaCreate, AlternativaOut
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/alternativas",
    tags=["alternativas"],
)


@router.post("/", response_model=AlternativaOut, status_code=status.HTTP_201_CREATED)
def create_alternativa(
    alternativa: AlternativaCreate,
    pergunta_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    # Verificar se a pergunta existe
    pergunta = db.query(Pergunta).filter(Pergunta.id == pergunta_id).first()
    if pergunta is None:
        raise HTTPException(status_code=404, detail="Pergunta não encontrada")

    # Verificar se o usuário é dono da pergunta
    if str(pergunta.user_id) != str(alternativa.user_id):
        raise HTTPException(
            status_code=403, detail="Usuário não tem permissão para esta pergunta"
        )

    # Verificar se a pergunta já tem 4 alternativas
    count = db.query(Alternativa).filter(Alternativa.pergunta_id == pergunta_id).count()
    if count >= 4:
        raise HTTPException(
            status_code=400,
            detail="A pergunta já possui o número máximo de 4 alternativas",
        )

    db_alternativa = Alternativa(
        texto=alternativa.texto,
        correta=alternativa.correta,
        pergunta_id=pergunta_id,
        user_id=alternativa.user_id,
    )
    db.add(db_alternativa)
    db.commit()
    db.refresh(db_alternativa)
    return db_alternativa


@router.get("/pergunta/{pergunta_id}", response_model=List[AlternativaOut])
def read_alternativas_by_pergunta(
    pergunta_id: uuid.UUID, db: Session = Depends(get_db)
):
    alternativas = (
        db.query(Alternativa).filter(Alternativa.pergunta_id == pergunta_id).all()
    )
    return alternativas


@router.get("/{alternativa_id}", response_model=AlternativaOut)
def read_alternativa(alternativa_id: uuid.UUID, db: Session = Depends(get_db)):
    alternativa = db.query(Alternativa).filter(Alternativa.id == alternativa_id).first()
    if alternativa is None:
        raise HTTPException(status_code=404, detail="Alternativa não encontrada")
    return alternativa
