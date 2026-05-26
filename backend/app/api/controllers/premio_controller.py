from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.usuario import Usuario
from app.schemas.premio_schema import SoftDeletePremioRequest
from app.services.premio_service import (
    cerrar_liga_y_calcular_premios,
    listar_ligas_apuesta,
    obtener_cierre_liga,
    soft_delete_premio
)


router = APIRouter(
    prefix="/api/premios",
    tags=["Premios"]
)


@router.get("/ligas")
def listar_ligas(
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(get_current_admin)
):
    """
    Lista todas las ligas de apuesta con su estado de cierre y conteo de miembros.
    Exclusiva para administradores (panel M7).
    """
    return listar_ligas_apuesta(db)


@router.post("/ligas/{id_liga}/cerrar")
def cerrar_liga(
    id_liga: int,
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(get_current_admin)
):
    """
    Cierra una liga de apuesta y calcula sus premios.
    Accion reservada a administradores.
    """
    return cerrar_liga_y_calcular_premios(db, id_liga)


@router.get("/ligas/{id_liga}")
def consultar_premios_liga(
    id_liga: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Consulta el cierre, distribucion y premios asignados de una liga.
    """
    return obtener_cierre_liga(db, id_liga)


@router.delete("/{id_premio}")
def eliminar_premio_logicamente(
    id_premio: int,
    request: SoftDeletePremioRequest,
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(get_current_admin)
):
    """
    Realiza soft delete de un premio. Accion reservada a administradores.
    El usuario que elimina se toma del token autenticado.
    """
    return soft_delete_premio(
        db=db,
        id_premio=id_premio,
        id_usuario=admin_actual.id_usuario,
        motivo=request.motivo
    )
