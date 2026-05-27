from sqlalchemy import Column, ForeignKey, Integer, String

from app.core.database import Base


class Estadio(Base):
    __tablename__ = "estadio"

    id_estadio = Column(Integer, primary_key=True, index=True)
    id_sede = Column(Integer, ForeignKey("sede.id_sede"), nullable=False)
    nombre = Column(String(100), nullable=False)
    capacidad = Column(Integer, nullable=True)
