from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre_completo: str
    email: EmailStr
    id_rol: int
    rol: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    usuario: UsuarioResponse


class RegistroRequest(BaseModel):
    nombre_completo: str = Field(min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class LogoutRequest(BaseModel):
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PerfilResponse(BaseModel):
    id_usuario: int
    nombre_completo: str
    email: EmailStr
    id_rol: int
    rol: str
    estado: str

class MensajeResponse(BaseModel):
    mensaje: str

class CambiarPasswordRequest(BaseModel):
    password_actual: str = Field(min_length=6)
    nueva_password: str = Field(min_length=6)

class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str = Field(min_length=6)
