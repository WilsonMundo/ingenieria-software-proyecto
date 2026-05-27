from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.core.database import Base


class Vaticinio(Base):

    __tablename__ = "vaticinio"

    id_vaticinio = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_liga_miembro = Column(
        Integer,
        ForeignKey("liga_miembro.id_liga_miembro"),
        nullable=False
    )

    id_partido = Column(
        Integer,
        ForeignKey("partido.id_partido"),
        nullable=False
    )

    goles_local_pred = Column(
        Integer,
        nullable=False
    )

    goles_visitante_pred = Column(
        Integer,
        nullable=False
    )

    fecha_registro = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    fecha_modificacion = Column(
        DateTime(timezone=True),
        nullable=True
    )

    partido = relationship(
        "Partido",
        back_populates="vaticinios"
    )
    puntaje = relationship("Puntaje", back_populates="vaticinio", uselist=False)
