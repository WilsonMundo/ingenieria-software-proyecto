from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.sql import func

from app.core.database import Base


class PaisGrupo(Base):
    __tablename__ = "pais_grupo"

    id_pais_grupo = Column(Integer, primary_key=True, index=True)
    id_pais = Column(Integer, ForeignKey("pais.id_pais"), nullable=False)
    id_grupo = Column(Integer, ForeignKey("grupo.id_grupo"), nullable=False)
    fecha_asignacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("id_pais", "id_grupo", name="uq_pais_grupo"),
        UniqueConstraint("id_grupo", "id_pais", name="uq_grupo_pais"),
    )
