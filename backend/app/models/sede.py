from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Sede(Base):
    __tablename__ = "sede"

    id_sede = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    pais_sede = Column(String(100), nullable=False)
