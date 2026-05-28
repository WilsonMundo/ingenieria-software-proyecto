from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.sql import func

from app.models.vaticinio import Vaticinio
from app.models.liga_miembro import LigaMiembro
from app.models.partido import Partido
from app.models.usuario import Usuario

from app.schemas.vaticinio_schema import VaticinioCreate


def validar_cierre_vaticinio(fecha_partido):
    fecha = fecha_partido
    if fecha.tzinfo is None:
        fecha = fecha.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > fecha - timedelta(minutes=15):
        raise HTTPException(
            status_code=400,
            detail="Las predicciones se cierran 15 minutos antes del partido."
        )


def crear_vaticinio(
    db: Session,
    data: VaticinioCreate,
    id_liga: int,
    usuario_actual: Usuario
):
    partido = (
        db.query(Partido)
        .filter(Partido.id_partido == data.id_partido)
        .first()
    )

    if not partido:
        raise HTTPException(
            status_code=404,
            detail="Partido no encontrado"
        )

    validar_cierre_vaticinio(partido.fecha_hora_inicio)

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
        existe.goles_local_pred = data.goles_local_pred
        existe.goles_visitante_pred = data.goles_visitante_pred
        existe.fecha_modificacion = func.now()

        db.commit()
        db.refresh(existe)

        return existe

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


def listar_predicciones_usuario(db: Session, usuario_actual: Usuario):
    filas = db.execute(
        text(
            """
            SELECT
                lm.id_liga_miembro,
                lm.id_liga,
                l.nombre AS liga_nombre,
                p.id_partido,
                p.fecha_hora_inicio,
                p.estado_partido,
                local.id_pais AS id_equipo_local,
                local.nombre AS nombre_local,
                local.codigo_fifa AS codigo_local,
                visitante.id_pais AS id_equipo_visitante,
                visitante.nombre AS nombre_visitante,
                visitante.codigo_fifa AS codigo_visitante,
                v.id_vaticinio,
                v.goles_local_pred,
                v.goles_visitante_pred,
                v.fecha_registro,
                v.fecha_modificacion,
                COALESCE(pu.puntos, 0) AS puntos,
                COALESCE(pu.acerto_resultado, false) AS acerto_resultado,
                COALESCE(pu.acerto_marcador, false) AS acerto_marcador
            FROM liga_miembro lm
            JOIN liga l
                ON l.id_liga = lm.id_liga
            JOIN partido p
                ON TRUE
            JOIN pais local
                ON local.id_pais = p.id_equipo_local
            JOIN pais visitante
                ON visitante.id_pais = p.id_equipo_visitante
            LEFT JOIN vaticinio v
                ON v.id_liga_miembro = lm.id_liga_miembro
                AND v.id_partido = p.id_partido
            LEFT JOIN puntaje pu
                ON pu.id_vaticinio = v.id_vaticinio
            WHERE lm.id_usuario = :id_usuario
                AND lm.estado_membresia = 'activo'
            ORDER BY p.fecha_hora_inicio ASC, l.nombre ASC
            """
        ),
        {"id_usuario": usuario_actual.id_usuario}
    ).mappings().all()

    predicciones = []
    for fila in filas:
        estado = (fila["estado_partido"] or "programado").upper()
        if estado == "PROGRAMADO":
            estado = "ABIERTO"

        predicciones.append({
            "id_liga_miembro": fila["id_liga_miembro"],
            "id_liga": fila["id_liga"],
            "liga_nombre": fila["liga_nombre"],
            "id_partido": fila["id_partido"],
            "fecha_hora_inicio": fila["fecha_hora_inicio"].isoformat() if fila["fecha_hora_inicio"] else None,
            "estado_partido": estado,
            "id_equipo_local": fila["id_equipo_local"],
            "id_equipo_visitante": fila["id_equipo_visitante"],
            "nombre_local": fila["nombre_local"],
            "codigo_local": (fila["codigo_local"] or "")[:3],
            "nombre_visitante": fila["nombre_visitante"],
            "codigo_visitante": (fila["codigo_visitante"] or "")[:3],
            "ha_predicho": fila["id_vaticinio"] is not None,
            "goles_local_pred": fila["goles_local_pred"],
            "goles_visitante_pred": fila["goles_visitante_pred"],
            "puntos": fila["puntos"],
            "acerto_resultado": fila["acerto_resultado"],
            "acerto_marcador": fila["acerto_marcador"],
            "fecha_registro": fila["fecha_registro"].isoformat() if fila["fecha_registro"] else None,
            "fecha_modificacion": fila["fecha_modificacion"].isoformat() if fila["fecha_modificacion"] else None,
        })

    total_predichas = sum(1 for item in predicciones if item["ha_predicho"])
    correctas = sum(1 for item in predicciones if item["acerto_resultado"])

    return {
        "estadisticas": {
            "total": len(predicciones),
            "pendientes": sum(
                1 for item in predicciones
                if not item["ha_predicho"] and item["estado_partido"] != "FINALIZADO"
            ),
            "correctas": correctas,
            "precision": round((correctas / total_predichas) * 100) if total_predichas else 0,
        },
        "predicciones": predicciones,
    }
