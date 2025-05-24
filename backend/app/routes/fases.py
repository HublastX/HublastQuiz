import uuid
from typing import List

from app.database.database import get_db
from app.models.models import Fase, Tema
from app.schemas.schemas import FaseCreate, FaseOut
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/fases",
    tags=["fases"],
)


@router.post("/", response_model=FaseOut, status_code=status.HTTP_201_CREATED)
def create_fase(fase: FaseCreate, tema_id: uuid.UUID, db: Session = Depends(get_db)):
    # Verificar se o tema existe
    tema = db.query(Tema).filter(Tema.id == tema_id).first()
    if tema is None:
        raise HTTPException(status_code=404, detail="Tema não encontrado")

    # Verificar se o usuário é dono do tema
    if str(tema.user_id) != str(fase.user_id):
        raise HTTPException(
            status_code=403, detail="Usuário não tem permissão para este tema"
        )

    db_fase = Fase(
        titulo=fase.titulo,
        descricao=fase.descricao,
        ordem=fase.ordem,
        tema_id=tema_id,
        user_id=fase.user_id,
    )
    db.add(db_fase)
    db.commit()
    db.refresh(db_fase)
    return db_fase


@router.get("/tema/{tema_id}", response_model=List[FaseOut])
def read_fases_by_tema(tema_id: uuid.UUID, db: Session = Depends(get_db)):
    fases = db.query(Fase).filter(Fase.tema_id == tema_id).all()
    return fases


@router.get("/{fase_id}", response_model=FaseOut)
def read_fase(fase_id: uuid.UUID, db: Session = Depends(get_db)):
    fase = db.query(Fase).filter(Fase.id == fase_id).first()
    if fase is None:
        raise HTTPException(status_code=404, detail="Fase não encontrada")
    return fase
