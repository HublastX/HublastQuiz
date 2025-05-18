from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.database.database import Base, engine
from app.routes import (
    alternativas,
    fases,
    gerar_perguntas_ia,
    pdf_generate_routes,
    perguntas,
    salve_questions_ia,
    temas,
)

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quiz API", description="API para um aplicativo de quiz", version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(temas.router)
app.include_router(salve_questions_ia.router)
app.include_router(fases.router)
app.include_router(pdf_generate_routes.router)
app.include_router(perguntas.router)
app.include_router(alternativas.router)
app.include_router(gerar_perguntas_ia.router)


@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo à API do Quiz! Acesse /docs para ver a documentação completa."
    }
