from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.auth_schema import MensajeResponse
from app.schemas.usuario_schema import UsuarioResponse
from app.services.usuario_service import listar_usuarios, dar_baja_usuario


router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)


@router.get("", response_model=List[UsuarioResponse])
def obtener_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return listar_usuarios(db, usuario_actual)


@router.patch("/{id_usuario}/dar-baja", response_model=MensajeResponse)
def dar_baja(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return dar_baja_usuario(db, id_usuario, usuario_actual)