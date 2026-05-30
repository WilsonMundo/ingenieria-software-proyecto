from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Puntaje(Base):
    __tablename__ = "puntaje"

    id_puntaje = Column(Integer, primary_key=True, index=True)
    id_vaticinio = Column(Integer, ForeignKey("vaticinio.id_vaticinio"), unique=True, nullable=False)
    puntos = Column(Integer, default=0, nullable=False)
    acerto_resultado = Column(Boolean, default=False, nullable=False)
    acerto_marcador = Column(Boolean, default=False, nullable=False)
    fecha_calculo = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    vaticinio = relationship("Vaticinio", back_populates="puntaje")
