from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.usuario import Usuario


def validar_admin(usuario_actual: Usuario):
    if usuario_actual.rol.nombre_rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede realizar esta acción"
        )


def listar_usuarios(db: Session, usuario_actual: Usuario):
    validar_admin(usuario_actual)

    usuarios = db.query(Usuario).order_by(Usuario.id_usuario.asc()).all()

    return [
        {
            "id_usuario": usuario.id_usuario,
            "nombre_completo": usuario.nombre_completo,
            "email": usuario.email,
            "estado": usuario.estado,
            "rol": usuario.rol.nombre_rol,
            "deleted_at": usuario.deleted_at
        }
        for usuario in usuarios
    ]


def dar_baja_usuario(db: Session, id_usuario: int, usuario_actual: Usuario):
    validar_admin(usuario_actual)

    if usuario_actual.id_usuario == id_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes darte de baja a ti mismo"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario.deleted_at is not None or usuario.estado == "inactivo":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya está dado de baja"
        )

    usuario.estado = "inactivo"
    usuario.deleted_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "mensaje": "Usuario dado de baja correctamente"
    }