from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Partido(Base):
    __tablename__ = "partido"

    id_partido = Column(Integer, primary_key=True, index=True)
    id_torneo = Column(Integer, ForeignKey("torneo.id_torneo"), nullable=False)
    id_fase = Column(Integer, ForeignKey("fase.id_fase"), nullable=False)
    id_grupo = Column(Integer, ForeignKey("grupo.id_grupo"), nullable=True)
    id_estadio = Column(Integer, ForeignKey("estadio.id_estadio"), nullable=False)
    id_equipo_local = Column(Integer, ForeignKey("pais.id_pais"), nullable=False)
    id_equipo_visitante = Column(Integer, ForeignKey("pais.id_pais"), nullable=False)
    fecha_hora_inicio = Column(DateTime(timezone=True), nullable=False)
    estado_partido = Column(String(20), default="programado", nullable=False)

    vaticinios = relationship(
        "Vaticinio",
        back_populates="partido"
    )
