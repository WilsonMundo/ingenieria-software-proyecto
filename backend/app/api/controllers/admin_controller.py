from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.usuario import Usuario
from app.services.admin_service import (
    listar_audit_log,
    obtener_dashboard_global,
    obtener_reporte_actividad
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Administracion"]
)


@router.get("/audit-log")
def consultar_auditoria(
    tabla: str | None = Query(default=None),
    operacion: str | None = Query(default=None),
    limite: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(get_current_admin)
):
    """
    Consulta la bitacora de auditoria del sistema.
    """
    return listar_audit_log(
        db=db,
        tabla=tabla,
        operacion=operacion,
        limite=limite
    )


@router.get("/dashboard-global")
def dashboard_global(
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(get_current_admin)
):
    """
    Devuelve totales generales para el panel administrativo.
    """
    return obtener_dashboard_global(db)


@router.get("/reportes/actividad")
def reporte_actividad(
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(get_current_admin)
):
    """
    Devuelve actividad agrupada por tabla y operacion.
    """
    return obtener_reporte_actividad(db)
