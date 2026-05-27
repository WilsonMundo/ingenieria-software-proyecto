from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.clasificacion_schema import (
    ClasificacionHistoricoItem,
    ClasificacionResponse,
    RecalculoClasificacionResponse,
)
from app.services.clasificacion_service import (
    obtener_clasificacion_liga,
    obtener_historico_clasificacion,
    recalcular_clasificacion_liga,
)

router = APIRouter(
    prefix="/api/ligas",
    tags=["Clasificacion"]
)


@router.get("/{id_liga}/clasificacion", response_model=ClasificacionResponse)
def consultar_clasificacion(
    id_liga: int,
    db: Session = Depends(get_db),
):
    return obtener_clasificacion_liga(db, id_liga)


@router.get(
    "/{id_liga}/clasificacion/historico",
    response_model=list[ClasificacionHistoricoItem],
)
def consultar_historico_clasificacion(
    id_liga: int,
    db: Session = Depends(get_db),
):
    return obtener_historico_clasificacion(db, id_liga)


@router.post(
    "/{id_liga}/clasificacion/recalcular",
    response_model=RecalculoClasificacionResponse,
)
def recalcular_clasificacion(
    id_liga: int,
    id_partido: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return recalcular_clasificacion_liga(db, id_liga, id_partido)
