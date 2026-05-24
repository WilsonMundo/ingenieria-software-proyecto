import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session


from app.core.config import settings
from app.core.security import crear_access_token, generar_password_hash, verificar_password
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.user_session import UserSession
from app.schemas.auth_schema import LoginRequest, RegistroRequest

def autenticar_usuario(db: Session, login_data: LoginRequest, ip_address: str | None = None, user_agent: str | None = None):
    usuario = db.query(Usuario).filter(Usuario.email == login_data.email).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if usuario.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no está activo"
        )

    password_correcta = verificar_password(
        login_data.password,
        usuario.password_hash
    )

    if not password_correcta:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    access_token = crear_access_token(
        data={
            "sub": usuario.email,
            "id_usuario": usuario.id_usuario,
            "rol": usuario.rol.nombre_rol
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    refresh_token = str(uuid.uuid4())
    fecha_expiracion_refresh = datetime.now(timezone.utc) + timedelta(days=7)

    nueva_sesion = UserSession(
        id_usuario=usuario.id_usuario,
        access_token=access_token,
        refresh_token=refresh_token,
        fecha_expiracion=fecha_expiracion_refresh,
        revocada=False,
        estado="activa",
        ip_address=ip_address,
        user_agent=user_agent
    )

    db.add(nueva_sesion)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "nombre_completo": usuario.nombre_completo,
            "email": usuario.email,
            "rol": usuario.rol.nombre_rol
        }
    }


def registrar_usuario(db: Session, registro_data: RegistroRequest):
    usuario_existente = db.query(Usuario).filter(
        Usuario.email == registro_data.email
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )

    rol_jugador = db.query(Rol).filter(Rol.nombre_rol == "jugador").first()

    if not rol_jugador:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No existe el rol jugador en la base de datos"
        )

    nuevo_usuario = Usuario(
        nombre_completo=registro_data.nombre_completo,
        email=registro_data.email,
        password_hash=generar_password_hash(registro_data.password),
        estado="activo",
        id_rol=rol_jugador.id_rol
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "mensaje": "Usuario registrado exitosamente"
    }


def solicitar_recuperacion_password(db: Session, email: str):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    return {
        "mensaje": "Si el correo existe, se enviarán instrucciones para recuperar la contraseña"
    }

def cerrar_sesion(db: Session, refresh_token: str):
    sesion = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token,
        UserSession.revocada == False,
        UserSession.estado == "cerrada"
    ).first()

    if not sesion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada o ya cerrada"
        )

    sesion.revocada = True
    db.commit()

    return {
        "mensaje": "Sesión cerrada correctamente"
    }


def obtener_perfil_usuario(usuario: Usuario):
    return {
        "id_usuario": usuario.id_usuario,
        "nombre_completo": usuario.nombre_completo,
        "email": usuario.email,
        "rol": usuario.rol.nombre_rol,
        "estado": usuario.estado
    }

def cambiar_password_usuario(db: Session, usuario: Usuario, password_actual: str, nueva_password: str):
    password_correcta = verificar_password(
        password_actual,
        usuario.password_hash
    )

    if not password_correcta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual no es correcta"
        )

    usuario.password_hash = generar_password_hash(nueva_password)

    db.commit()

    return {
        "mensaje": "Contraseña actualizada correctamente"
    }