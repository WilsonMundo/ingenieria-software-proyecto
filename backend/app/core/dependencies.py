from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decodificar_token
from app.models.usuario import Usuario


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decodificar_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin usuario válido"
        )

    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )

    if usuario.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    return usuario


def get_current_admin(
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Dependencia que exige que el usuario autenticado tenga rol
    'administrador'. Reutiliza get_current_user y agrega la
    validacion de rol para los endpoints del panel global (M7)
    y para las acciones criticas del motor de premios (M6).
    """
    if usuario_actual.rol.nombre_rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede realizar esta accion"
        )

    return usuario_actual