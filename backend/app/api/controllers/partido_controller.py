from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.partido_service import (
    obtener_partidos_mundial
)

router = APIRouter(
    prefix="/api/partidos",
    tags=["Partidos"]
)

@router.get("")
def obtener_partidos(
    db: Session = Depends(get_db)
):

    return obtener_partidos_mundial(db)