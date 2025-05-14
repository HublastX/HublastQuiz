import tempfile
from typing import Optional

from app.services.analisy_questions_pdf import analyze_questions_pdf
from fastapi import APIRouter, File, HTTPException, Query, UploadFile

router = APIRouter()


@router.post("/questions/")
async def create_multiple_questions_for_phase(
    file: UploadFile = File(...),
    numero_de_questoes: Optional[int] = Query(
        default=9, ge=1, le=9, title="Número de questões"
    ),
    numero_de_alternativas: Optional[int] = Query(
        default=4, ge=2, le=4, title="Número de alternativas"
    ),
):
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    if numero_de_questoes is not None:
        if not (1 <= numero_de_questoes <= 9):
            raise HTTPException(
                status_code=400, detail="Número deve ser um inteiro entre 1 e 9"
            )

    if numero_de_alternativas is not None:
        if not (2 <= numero_de_alternativas <= 4):
            raise HTTPException(
                status_code=400, detail="Número deve ser um inteiro entre 0 e 9"
            )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    questions_data = await analyze_questions_pdf(
        temp_path, numero_de_questoes, numero_de_alternativas
    )

    return questions_data
