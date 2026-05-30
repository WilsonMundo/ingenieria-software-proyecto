from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_token"

    id_reset_token = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)

    token = Column(String(150), unique=True, nullable=False)
    usado = Column(Boolean, nullable=False, default=False)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_expiracion = Column(DateTime(timezone=True), nullable=False)

    usuario = relationship("Usuario")