from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Lo que se recibe desde el Frontend (Angular) al hacer la apuesta
class VaticinioCreate(BaseModel):
    id_partido: int
    id_liga_miembro: int
    goles_local_pred: int
    goles_visitante_pred: int

# Lo que el Backend le responde al Frontend confirmando el éxito
class VaticinioResponse(BaseModel):
    id_vaticinio: int
    id_liga_miembro: int
    id_partido: int
    goles_local_pred: int
    goles_visitante_pred: int
    fecha_registro: Optional[str] = None
    fecha_modificacion: Optional[str] = None

    class Config:
        from_attributes = True