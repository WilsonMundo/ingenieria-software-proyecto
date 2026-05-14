from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Liga(Base):
    __tablename__ = "liga"

    id_liga = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    tipo_liga = Column(String(20), nullable=False)
    precio_participacion = Column(Numeric(10, 2), default=0.00)
    id_creador_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_admin_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    estado = Column(String(20), default="activa", nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    invitaciones = relationship("InvitacionLiga", back_populates="liga")
    miembros = relationship("LigaMiembro", back_populates="liga")