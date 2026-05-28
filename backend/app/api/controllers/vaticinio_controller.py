from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.usuario import Usuario

from app.schemas.vaticinio_schema import VaticinioCreate

from app.services.vaticinio_service import crear_vaticinio
from app.services.vaticinio_service import obtener_vaticinios_usuario


router = APIRouter(
    prefix="/api/vaticinios",
    tags=["Vaticinios"]
)


@router.post("/{id_liga}")
def crear_nuevo_vaticinio(
    id_liga: int,
    data: VaticinioCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):

    return crear_vaticinio(
        db,
        data,
        id_liga,
        usuario_actual
    )


@router.get("/{id_liga}")
def obtener_vaticinios(
    id_liga: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):

    return obtener_vaticinios_usuario(
        db,
        id_liga,
        usuario_actual
    )