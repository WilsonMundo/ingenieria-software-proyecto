from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Torneo(Base):
    __tablename__ = "torneo"

    id_torneo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    anio = Column(Integer, nullable=False)
    estado = Column(String(20), nullable=False)
