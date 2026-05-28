from datetime import datetime
from decimal import Decimal
from typing import Optional

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
    precio_participacion: float
    estado: str

    rol_liga: Optional[str] = None
    total_participantes: Optional[int] = None

    class Config:
        from_attributes = True