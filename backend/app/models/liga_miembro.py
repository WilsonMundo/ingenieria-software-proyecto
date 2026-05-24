from sqlalchemy import Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class LigaMiembro(Base):
    __tablename__ = "liga_miembro"

    id_liga_miembro = Column(Integer, primary_key=True, index=True)
    id_liga = Column(Integer, ForeignKey("liga.id_liga"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    nombre_equipo = Column(String(50), nullable=False)
    rol_liga = Column(String(20), nullable=False)
    estado_membresia = Column(String(20), default="activo", nullable=False)
    fecha_union = Column(Date, server_default=func.current_date(), nullable=False)

    liga = relationship("Liga", back_populates="miembros")
    usuario = relationship("Usuario")

    __table_args__ = (
        UniqueConstraint("id_liga", "id_usuario", name="uq_liga_usuario"),
        UniqueConstraint("id_liga", "nombre_equipo", name="uq_liga_nombre_equipo"),
    )