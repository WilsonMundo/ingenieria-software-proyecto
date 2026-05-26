from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.models.vaticinio import Vaticinio
from app.models.liga_miembro import LigaMiembro
from app.models.usuario import Usuario

from app.schemas.vaticinio_schema import VaticinioCreate


def crear_vaticinio(
    db: Session,
    data: VaticinioCreate,
    id_liga: int,
    usuario_actual: Usuario
):

    miembro = (
        db.query(LigaMiembro)
        .filter(
            LigaMiembro.id_liga == id_liga,
            LigaMiembro.id_usuario == usuario_actual.id_usuario
        )
        .first()
    )

    if not miembro:
        raise HTTPException(
            status_code=404,
            detail="Miembro no encontrado"
        )

    existe = (
        db.query(Vaticinio)
        .filter(
            Vaticinio.id_liga_miembro == miembro.id_liga_miembro,
            Vaticinio.id_partido == data.id_partido
        )
        .first()
    )

    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un vaticinio para este partido"
        )

    nuevo = Vaticinio(
        id_liga_miembro=miembro.id_liga_miembro,
        id_partido=data.id_partido,
        goles_local_pred=data.goles_local_pred,
        goles_visitante_pred=data.goles_visitante_pred
    )

    db.add(nuevo)

    db.commit()

    db.refresh(nuevo)

    return nuevo