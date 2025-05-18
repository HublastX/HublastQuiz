from typing import Annotated, Dict, Any
from uuid import UUID
import logging
import json
import sys

from app.database.database import get_db
from app.models.models import Alternativa, Pergunta
from app.schemas.pdf_ia import (
    RespostaPerguntasImportadas,
)
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.orm import Session
from pydantic import ValidationError

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
    request: Request,
    dados: Dict[str, Any] = Body(...),
    db: Annotated[Session, Depends(get_db)],
):
    try:
        # Log detalhado dos dados recebidos
        sys.stdout.write(f"DADOS RECEBIDOS (TIPO): {type(dados)}\n")
        sys.stdout.write(f"DADOS RECEBIDOS (CONTEÚDO): {json.dumps(dados, default=str)}\n")
        sys.stdout.write(f"TEMA_ID: {tema_id}, FASE_ID: {fase_id}, USER_ID: {user_id}\n")
        
        if "perguntas" in dados:
            sys.stdout.write(f"PERGUNTAS (TIPO): {type(dados['perguntas'])}\n")
            sys.stdout.write(f"NÚMERO DE PERGUNTAS: {len(dados['perguntas'])}\n")
            if dados["perguntas"]:
                primeira_pergunta = dados["perguntas"][0]
                sys.stdout.write(f"PRIMEIRA PERGUNTA: {json.dumps(primeira_pergunta, default=str)}\n")
                if "alternativas" in primeira_pergunta:
                    sys.stdout.write(f"ALTERNATIVAS (TIPO): {type(primeira_pergunta['alternativas'])}\n")
                    sys.stdout.write(f"NÚMERO DE ALTERNATIVAS: {len(primeira_pergunta['alternativas'])}\n")
        
        sys.stdout.flush()
        
        # Verificar se o formato é válido
        if not isinstance(dados, dict) or "perguntas" not in dados:
            sys.stdout.write("ERRO: Formato inválido - esperado objeto com propriedade 'perguntas'\n")
            sys.stdout.flush()
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Formato inválido: esperado um objeto com a propriedade 'perguntas'"
            )
            
        # Verificar se perguntas é uma lista
        if not isinstance(dados["perguntas"], list):
            sys.stdout.write(f"ERRO: Formato inválido - 'perguntas' deve ser uma lista, recebido: {type(dados['perguntas'])}\n")
            sys.stdout.flush()
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Formato inválido: 'perguntas' deve ser uma lista"
            )
            
        # Verificar se a lista de perguntas não está vazia
        if len(dados["perguntas"]) == 0:
            sys.stdout.write("ERRO: Nenhuma pergunta fornecida\n")
            sys.stdout.flush()
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Nenhuma pergunta fornecida"
            )
        
        perguntas_count = 0
        alternativas_count = 0
        
        # Processar cada pergunta diretamente
        for p in dados["perguntas"]:
            # Verificar campos obrigatórios
            if not isinstance(p, dict):
                sys.stdout.write(f"ERRO: Pergunta deve ser um objeto, recebido: {type(p)}\n")
                sys.stdout.flush()
                continue
                
            if "pergunta" not in p or not p["pergunta"]:
                sys.stdout.write(f"ERRO: Pergunta sem texto: {p}\n")
                sys.stdout.flush()
                continue
                
            if "alternativas" not in p or not isinstance(p["alternativas"], list) or len(p["alternativas"]) == 0:
                sys.stdout.write(f"ERRO: Pergunta sem alternativas válidas: {p}\n")
                sys.stdout.flush()
                continue
            
            # Log detalhado da pergunta
            sys.stdout.write(f"PROCESSANDO PERGUNTA: {p['pergunta']}\n")
            sys.stdout.flush()
            
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
                if not isinstance(alt, dict):
                    sys.stdout.write(f"ERRO: Alternativa deve ser um objeto, recebido: {type(alt)}\n")
                    sys.stdout.flush()
                    continue
                    
                if "texto" not in alt or not alt["texto"]:
                    sys.stdout.write(f"ERRO: Alternativa sem texto: {alt}\n")
                    sys.stdout.flush()
                    continue
                
                # Log detalhado da alternativa
                sys.stdout.write(f"PROCESSANDO ALTERNATIVA {i+1}: {alt['texto']}, Correta: {alt.get('correta', False)}, Letra: {alt.get('letra', chr(65 + i))}\n")
                sys.stdout.flush()
                
                # Definir letra se não existir
                letra = alt.get("letra", chr(65 + i))  # A, B, C, D...
                
                # Garantir que o valor de correta seja booleano
                correta = False
                if "correta" in alt:
                    if isinstance(alt["correta"], bool):
                        correta = alt["correta"]
                    else:
                        # Tentar converter para booleano
                        try:
                            correta = bool(alt["correta"])
                            sys.stdout.write(f"AVISO: Convertendo valor não-booleano para booleano: {alt['correta']} -> {correta}\n")
                            sys.stdout.flush()
                        except Exception as e:
                            sys.stdout.write(f"ERRO: Não foi possível converter 'correta' para booleano: {str(e)}\n")
                            sys.stdout.flush()
                
                # Criar alternativa
                nova_alternativa = Alternativa(
                    texto=alt["texto"],
                    correta=correta,
                    letra=letra,
                    pergunta_id=nova_pergunta.id,
                    user_id=user_id,
                )
                db.add(nova_alternativa)
                alternativas_count += 1
        
        db.commit()
        sys.stdout.write(f"SUCESSO: {perguntas_count} perguntas e {alternativas_count} alternativas importadas\n")
        sys.stdout.flush()
        
        return RespostaPerguntasImportadas(
            mensagem="Perguntas e alternativas importadas com sucesso!",
            perguntas_importadas=perguntas_count,
            alternativas_importadas=alternativas_count,
        )
            
    except Exception as e:
        sys.stdout.write(f"ERRO GERAL: {str(e)}\n")
        sys.stdout.flush()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar perguntas: {str(e)}",
        )


@router.post("/teste-simples")
async def importar_perguntas_teste_simples(
    db: Annotated[Session, Depends(get_db)],
):
    try:
        # Usar valores fixos para teste
        tema_id = UUID("fd38ddd4-7352-4280-90fe-76f387e589cd")
        fase_id = UUID("68e8a597-987f-4153-9e39-24382f1facb2")
        user_id = UUID("464cf4d0-cf5c-4f46-be0b-91ec486e07cb")
        
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
        
        sys.stdout.write(f"DADOS DE TESTE SIMPLES: {dados_teste}\n")
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
        sys.stdout.write(f"SUCESSO TESTE SIMPLES: {perguntas_count} perguntas e {alternativas_count} alternativas importadas\n")
        sys.stdout.flush()
        
        return {
            "mensagem": "Perguntas e alternativas de teste importadas com sucesso!",
            "perguntas_importadas": perguntas_count,
            "alternativas_importadas": alternativas_count,
        }
            
    except Exception as e:
        sys.stdout.write(f"ERRO GERAL TESTE SIMPLES: {str(e)}\n")
        sys.stdout.flush()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar perguntas de teste: {str(e)}",
        )
