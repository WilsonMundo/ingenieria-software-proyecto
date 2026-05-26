from datetime import datetime
from pydantic import BaseModel, EmailStr


class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre_completo: str
    email: EmailStr
    estado: str
    rol: str
    deleted_at: datetime | None = None

    class Config:
        from_attributes = True