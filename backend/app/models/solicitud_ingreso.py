from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SolicitudIngreso(Base):
    __tablename__ = "solicitud_ingreso"

    id_solicitud = Column(Integer, primary_key=True, index=True)
    id_liga = Column(Integer, ForeignKey("liga.id_liga"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    estado = Column(String(20), default="pendiente", nullable=False)
    fecha_solicitud = Column(DateTime(timezone=True), server_default=func.now())
    fecha_resolucion = Column(DateTime(timezone=True), nullable=True)

    liga = relationship("Liga")
    usuario = relationship("Usuario")