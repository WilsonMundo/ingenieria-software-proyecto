from datetime import datetime
from typing import Optional

from pydantic import BaseModel

class SolicitudIngresoCreate(BaseModel):
    id_liga: int

class SolicitudIngresoResponse(BaseModel):
    id_solicitud: int
    id_liga: int
    id_usuario: int
    estado: str
    fecha_solicitud: datetime
    fecha_resolucion: Optional[datetime] = None
    class Config:
        from_attributes = True

class ResolverSolicitudRequest(BaseModel):
    estado: str