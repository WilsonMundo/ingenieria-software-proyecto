from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.core.database import Base

class Partido(Base):
    __tablename__ = "partido"
    id_partido = Column(
        Integer,
        primary_key=True
    )
    id_torneo = Column(
        Integer,
        ForeignKey("torneo.id_torneo")
    )
    id_equipo_local = Column(
        Integer,
        ForeignKey("pais.id_pais")
    )
    id_equipo_visitante = Column(
        Integer,
        ForeignKey("pais.id_pais")
    )
    fecha_hora_inicio = Column(
        DateTime,
        nullable=False
    )
    vaticinios = relationship(
        "Vaticinio",
        back_populates="partido"
    )