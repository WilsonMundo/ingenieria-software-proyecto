from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(150), nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="rol")