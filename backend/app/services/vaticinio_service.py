from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.models.vaticinio import Vaticinio
from app.models.liga_miembro import LigaMiembro
from app.models.partido import Partido
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
            LigaMiembro.id_usuario == usuario_actual.id_usuario,
            LigaMiembro.estado_membresia == "activo"
        )
        .first()
    )
    if not miembro:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No perteneces a esta liga"
        )
    partido = (
        db.query(Partido)
        .filter(
            Partido.id_partido == data.id_partido
        )
        .first()
    )
    if not partido:
        raise HTTPException(
            status_code=404,
            detail="Partido no encontrado"
        )
    fecha_limite = (
        partido.fecha_hora_inicio - timedelta(minutes=15)
    )
    ahora = datetime.now(timezone.utc)
    if ahora >= fecha_limite:
        raise HTTPException(
            status_code=400,
            detail="El tiempo para editar este vaticinio ha finalizado"
        )
    vaticinio_existente = (
        db.query(Vaticinio)
        .filter(
            Vaticinio.id_liga_miembro == miembro.id_liga_miembro,
            Vaticinio.id_partido == data.id_partido
        )
        .first()
    )
    if vaticinio_existente:
        vaticinio_existente.goles_local_pred = (
            data.goles_local_pred
        )
        vaticinio_existente.goles_visitante_pred = (
            data.goles_visitante_pred
        )
        vaticinio_existente.fecha_modificacion = ahora
        db.commit()
        db.refresh(vaticinio_existente)
        return {
            "message": "Vaticinio actualizado",
            "data": vaticinio_existente
        }
    nuevo_vaticinio = Vaticinio(
        id_liga_miembro=miembro.id_liga_miembro,
        id_partido=data.id_partido,
        goles_local_pred=data.goles_local_pred,
        goles_visitante_pred=data.goles_visitante_pred
    )
    db.add(nuevo_vaticinio)
    db.commit()
    db.refresh(nuevo_vaticinio)
    return {
        "message": "Vaticinio creado",
        "data": nuevo_vaticinio
    }

def obtener_vaticinios_usuario(
    db: Session,
    id_liga: int,
    usuario_actual: Usuario
):
    miembro = (
        db.query(LigaMiembro)
        .filter(
            LigaMiembro.id_liga == id_liga,
            LigaMiembro.id_usuario == usuario_actual.id_usuario,
            LigaMiembro.estado_membresia == "activo"
        )
        .first()
    )
    if not miembro:
        raise HTTPException(
            status_code=403,
            detail="No perteneces a esta liga"
        )
    vaticinios = (
        db.query(Vaticinio)
        .filter(
            Vaticinio.id_liga_miembro == miembro.id_liga_miembro
        )
        .all()
    )
    resultado = []
    for v in vaticinios:
        partido = (
            db.query(Partido)
            .filter(
                Partido.id_partido == v.id_partido
            )
            .first()
        )
        if not partido:
            continue
        fecha_limite = (
            partido.fecha_hora_inicio - timedelta(minutes=15)
        )
        editable = (
            datetime.now(timezone.utc) < fecha_limite
        )
        resultado.append({
            "id_partido": v.id_partido,
            "goles_local_pred": v.goles_local_pred,
            "goles_visitante_pred": v.goles_visitante_pred,
            "editable": editable
        })

    return resultado