from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base

class Partido(Base):
    __tablename__ = "partido"
    id_partido = Column(Integer, primary_key=True)
    vaticinios = relationship(
        "Vaticinio",
        back_populates="partido"
    )