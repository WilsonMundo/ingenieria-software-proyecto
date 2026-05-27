from pydantic import BaseModel

class VaticinioCreate(BaseModel):
    id_partido: int
    goles_local_pred: int
    goles_visitante_pred: int