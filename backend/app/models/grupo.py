from sqlalchemy import Column, ForeignKey, Integer, String

from app.core.database import Base


class Grupo(Base):
    __tablename__ = "grupo"

    id_grupo = Column(Integer, primary_key=True, index=True)
    id_torneo = Column(Integer, ForeignKey("torneo.id_torneo"), nullable=False)
    nombre = Column(String(20), nullable=False)
