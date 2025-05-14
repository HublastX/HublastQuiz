from fastapi import FastAPI

from app.database.database import Base, engine
from app.routes import (
    alternativas,
    fases,
    pdf_generate_routes,
    perguntas,
    salve_questions_ia,
    temas,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quiz API", description="API para um aplicativo de quiz", version="1.0.0"
)


app.include_router(temas.router)
app.include_router(salve_questions_ia.router)
app.include_router(fases.router)
app.include_router(pdf_generate_routes.router)
app.include_router(perguntas.router)
app.include_router(alternativas.router)


@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo à API do Quiz! Acesse /docs para ver a documentação completa."
    }
