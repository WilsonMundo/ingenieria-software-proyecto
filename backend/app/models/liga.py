from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Numeric
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Liga(Base):
    __tablename__ = "liga"

    id_liga = Column(Integer, primary_key=True, index=True)

    nombre = Column(String(100), unique=True, nullable=False)

    tipo_liga = Column(String(20), nullable=False)

    precio_participacion = Column(
        Numeric(10, 2),
        default=0.00,
        nullable=False
    )

    id_creador_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )

    id_admin_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )

    estado = Column(
        String(20),
        default="activa",
        nullable=False
    )

    fecha_creacion = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    creador = relationship(
        "Usuario",
        foreign_keys=[id_creador_usuario]
    )

    administrador = relationship(
        "Usuario",
        foreign_keys=[id_admin_usuario]
    )

    miembros = relationship(
        "LigaMiembro",
        back_populates="liga",
        cascade="all, delete-orphan"
    )

    invitaciones = relationship(
        "InvitacionLiga",
        back_populates="liga"
    )