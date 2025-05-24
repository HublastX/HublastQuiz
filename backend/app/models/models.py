import uuid

from app.database.database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class Tema(Base):
    __tablename__ = "temas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)

    fases = relationship("Fase", back_populates="tema", cascade="all, delete-orphan")


class Fase(Base):
    __tablename__ = "fases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    ordem = Column(Integer, nullable=False)
    tema_id = Column(UUID(as_uuid=True), ForeignKey("temas.id"))
    user_id = Column(UUID(as_uuid=True), nullable=False)

    tema = relationship("Tema", back_populates="fases")
    perguntas = relationship(
        "Pergunta", back_populates="fase", cascade="all, delete-orphan"
    )


class Pergunta(Base):
    __tablename__ = "perguntas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    texto = Column(Text, nullable=False)
    fase_id = Column(UUID(as_uuid=True), ForeignKey("fases.id"))
    user_id = Column(UUID(as_uuid=True), nullable=False)

    fase = relationship("Fase", back_populates="perguntas")
    alternativas = relationship(
        "Alternativa", back_populates="pergunta", cascade="all, delete-orphan"
    )


class Alternativa(Base):
    __tablename__ = "alternativas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    texto = Column(Text, nullable=False)
    correta = Column(Boolean, default=False)
    pergunta_id = Column(UUID(as_uuid=True), ForeignKey("perguntas.id"))
    user_id = Column(UUID(as_uuid=True), nullable=False)

    pergunta = relationship("Pergunta", back_populates="alternativas")
