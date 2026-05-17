from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class InvitacionLiga(Base):
    __tablename__ = "invitacion_liga"

    id_invitacion = Column(Integer, primary_key=True, index=True)
    id_liga = Column(Integer, ForeignKey("liga.id_liga"), nullable=False)
    email_destino = Column(String(120), nullable=False)
    token = Column(String(150), unique=True, nullable=False)
    fecha_envio = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), default="pendiente", nullable=False)

    liga = relationship("Liga", back_populates="invitaciones")