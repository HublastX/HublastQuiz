import uuid
from typing import List

from app.database.database import get_db
from app.models.models import Tema
from app.schemas.schemas import TemaCreate, TemaOut
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/temas",
    tags=["temas"],
)


@router.post("/", response_model=TemaOut, status_code=status.HTTP_201_CREATED)
def create_tema(tema: TemaCreate, db: Session = Depends(get_db)):
    db_tema = Tema(titulo=tema.titulo, descricao=tema.descricao, user_id=tema.user_id)
    db.add(db_tema)
    db.commit()
    db.refresh(db_tema)
    return db_tema


@router.get("/", response_model=List[TemaOut])
def read_temas(
    user_id: uuid.UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    temas = (
        db.query(Tema).filter(Tema.user_id == user_id).offset(skip).limit(limit).all()
    )
    return temas


@router.get("/{tema_id}", response_model=TemaOut)
def read_tema(tema_id: uuid.UUID, db: Session = Depends(get_db)):
    tema = db.query(Tema).filter(Tema.id == tema_id).first()
    if tema is None:
        raise HTTPException(status_code=404, detail="Tema não encontrado")
    return tema
