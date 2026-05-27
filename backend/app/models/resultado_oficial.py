from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func

from app.core.database import Base


class ResultadoOficial(Base):
    __tablename__ = "resultado_oficial"

    id_resultado = Column(Integer, primary_key=True, index=True)
    id_partido = Column(Integer, ForeignKey("partido.id_partido"), unique=True, nullable=False)
    goles_local = Column(Integer, nullable=False)
    goles_visitante = Column(Integer, nullable=False)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    bloqueado = Column(Boolean, default=False, nullable=False)
