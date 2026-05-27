from sqlalchemy import Column, ForeignKey, Integer, String

from app.core.database import Base


class Fase(Base):
    __tablename__ = "fase"

    id_fase = Column(Integer, primary_key=True, index=True)
    id_torneo = Column(Integer, ForeignKey("torneo.id_torneo"), nullable=False)
    nombre = Column(String(50), nullable=False)
    orden_fase = Column(Integer, nullable=False)
