from pydantic import BaseModel, EmailStr


class EnviarInvitacionRequest(BaseModel):
    id_liga: int
    email_destino: EmailStr


class InvitacionResponse(BaseModel):
    mensaje: str
    email_destino: EmailStr
    usuario_registrado: bool
    token: str
    enlace: str


class ValidarInvitacionResponse(BaseModel):
    id_invitacion: int
    id_liga: int
    email_destino: EmailStr
    estado: str
    usuario_registrado: bool


class AceptarInvitacionRequest(BaseModel):
    token: str
    id_usuario: int
    nombre_equipo: str | None = None