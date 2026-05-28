from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.usuario import Usuario
from app.schemas.solicitud_schema import ResolverSolicitudRequest

from app.services.solicitud_service import ( crear_solicitud_ingreso, obtener_solicitudes_pendientes, resolver_solicitud )

router = APIRouter(
    prefix="/api/solicitudes",
    tags=["Solicitudes"]
)

# CREAR SOLICITUD
@router.post(
    "/{id_liga}",
    status_code=status.HTTP_201_CREATED
)
def crear_solicitud(
    id_liga: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return crear_solicitud_ingreso(
        db=db,
        id_liga=id_liga,
        usuario_actual=usuario_actual
    )


# LISTAR SOLICITUDES PENDIENTES (ADMIN)
@router.get(
    "/{id_liga}",
    status_code=status.HTTP_200_OK
)
def listar_solicitudes(
    id_liga: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return obtener_solicitudes_pendientes(
        db=db,
        id_liga=id_liga,
        usuario_actual=usuario_actual
    )


# RESOLVER SOLICITUD
@router.put(
    "/{id_solicitud}",
    status_code=status.HTTP_200_OK
)
def resolver(
    id_solicitud: int,
    data: ResolverSolicitudRequest,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    return resolver_solicitud(
        db=db,
        id_solicitud=id_solicitud,
        data=data,
        usuario_actual=usuario_actual
    )