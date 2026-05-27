from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class LigaCreate(BaseModel):
    nombre: str
    tipo_liga: str
    precio_participacion: Decimal = 0
    nombre_equipo: str


class LigaResponse(BaseModel):
    id_liga: int
    nombre: str
    tipo_liga: str
    precio_participacion: Decimal
    estado: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True