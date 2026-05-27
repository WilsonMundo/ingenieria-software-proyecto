from sqlalchemy import CHAR, Column, ForeignKey, Integer, String

from app.core.database import Base


class Pais(Base):
    __tablename__ = "pais"

    id_pais = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo_fifa = Column(CHAR(3), unique=True, nullable=False)
    confederacion = Column(String(50), nullable=True)
    id_grupo = Column(Integer, ForeignKey("grupo.id_grupo"), nullable=True)
