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
from app.models.password_reset_token import PasswordResetToken
from app.services.email_service import enviar_correo_recuperacion_password

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
    usuario = db.query(Usuario).filter(
        Usuario.email == email,
        Usuario.estado == "activo",
        Usuario.deleted_at.is_(None)
    ).first()

    if not usuario:
        return {
            "mensaje": "Si el correo existe, se enviarán instrucciones para recuperar la contraseña"
        }

    token = str(uuid.uuid4())

    reset_token = PasswordResetToken(
        id_usuario=usuario.id_usuario,
        token=token,
        usado=False,
        fecha_expiracion=datetime.now(timezone.utc) + timedelta(minutes=30)
    )

    db.add(reset_token)
    db.commit()

    enviar_correo_recuperacion_password(
        email_destino=usuario.email,
        nombre_usuario=usuario.nombre_completo,
        token=token
    )

    return {
        "mensaje": "Si el correo existe, se enviarán instrucciones para recuperar la contraseña"
    }

def resetear_password_usuario(db: Session, token: str, nueva_password: str):
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.usado == False
    ).first()

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o ya utilizado"
        )

    fecha_actual = datetime.now(timezone.utc)

    if reset_token.fecha_expiracion < fecha_actual:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de recuperación ha expirado"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == reset_token.id_usuario,
        Usuario.estado == "activo",
        Usuario.deleted_at.is_(None)
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado o inactivo"
        )

    usuario.password_hash = generar_password_hash(nueva_password)
    reset_token.usado = True

    db.commit()

    return {
        "mensaje": "Contraseña restablecida correctamente"
    }

def cerrar_sesion(db: Session, refresh_token: str):
    sesion = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token,
        UserSession.revocada == False
    ).first()

    if not sesion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada o ya cerrada"
        )

    sesion.revocada = True
    sesion.estado = "cerrada"

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