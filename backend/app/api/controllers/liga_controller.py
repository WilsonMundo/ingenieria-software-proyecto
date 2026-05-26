from typing import List

from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.usuario import Usuario

from app.schemas.liga_schema import LigaCreate
from app.schemas.liga_schema import LigaResponse

from app.services.liga_service import obtener_ligas_usuario
from app.services.liga_service import crear_liga
from app.services.liga_service import obtener_liga_por_id

router = APIRouter(
    prefix="/api/ligas",
    tags=["Ligas"]
)

@router.get(
    "",
    response_model=List[LigaResponse]
)
def obtener_ligas(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return obtener_ligas_usuario(
        db,
        usuario_actual
    )

@router.get(
    "/{id_liga}",
    response_model=LigaResponse
)
def obtener_liga(
    id_liga: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return obtener_liga_por_id(
        db,
        id_liga,
        usuario_actual
    )

@router.post(
    "",
    response_model=LigaResponse
)
def crear_nueva_liga(
    data: LigaCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return crear_liga(
        db,
        data,
        usuario_actual
    )