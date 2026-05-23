from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class UserSession(Base):
    __tablename__ = "user_sessions"

    id_session = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    estado = Column(String(20), nullable=False, default="activa")

    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, unique=True, nullable=False)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_expiracion = Column(DateTime(timezone=True), nullable=False)

    revocada = Column(Boolean, default=False, nullable=False)
    estado = Column(String(20), nullable=False, default="activa")

    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)

    usuario = relationship("Usuario")