from pydantic import BaseModel, Field

class VaticinioCreate(BaseModel):
    id_partido: int
    goles_local_pred: int = Field(ge=0)
    goles_visitante_pred: int = Field(ge=0)
