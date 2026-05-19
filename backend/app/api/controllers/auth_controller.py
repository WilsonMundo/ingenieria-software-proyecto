from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MensajeResponse,
    PerfilResponse,
    RegistroRequest,
    CambiarPasswordRequest
)
from app.services.auth_service import (
    autenticar_usuario,
    cambiar_password_usuario,
    cerrar_sesion,
    obtener_perfil_usuario,
    registrar_usuario,
    solicitar_recuperacion_password
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return autenticar_usuario(
        db=db,
        login_data=login_data,
        ip_address=ip_address,
        user_agent=user_agent
    )


@router.post("/registro", response_model=MensajeResponse)
def registro(registro_data: RegistroRequest, db: Session = Depends(get_db)):
    return registrar_usuario(db, registro_data)


@router.post("/olvido-contrasenia", response_model=MensajeResponse)
def olvido_contrasenia(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return solicitar_recuperacion_password(db, data.email)


@router.get("/perfil", response_model=PerfilResponse)
def perfil(usuario_actual: Usuario = Depends(get_current_user)):
    return obtener_perfil_usuario(usuario_actual)


@router.post("/logout", response_model=MensajeResponse)
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    return cerrar_sesion(db, data.refresh_token)

@router.put("/cambiar-password", response_model=MensajeResponse)
def cambiar_password(
    data: CambiarPasswordRequest,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return cambiar_password_usuario(
        db=db,
        usuario=usuario_actual,
        password_actual=data.password_actual,
        nueva_password=data.nueva_password
    )