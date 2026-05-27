from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session


PUNTOS_MARCADOR_EXACTO = 3
PUNTOS_RESULTADO = 1


def asegurar_tabla_historico(db: Session) -> None:
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS clasificacion_historico (
                id_historico SERIAL PRIMARY KEY,
                id_liga INT NOT NULL REFERENCES liga(id_liga) ON DELETE CASCADE,
                id_liga_miembro INT NOT NULL REFERENCES liga_miembro(id_liga_miembro) ON DELETE CASCADE,
                id_partido INT,
                posicion_anterior INT,
                posicion_actual INT NOT NULL,
                puntos_acumulados INT NOT NULL DEFAULT 0,
                fecha_calculo TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
    )
    db.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS idx_clasificacion_historico_liga_fecha
            ON clasificacion_historico(id_liga, fecha_calculo DESC)
            """
        )
    )
    db.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS idx_clasificacion_historico_miembro
            ON clasificacion_historico(id_liga_miembro)
            """
        )
    )


def obtener_clasificacion_liga(db: Session, id_liga: int) -> dict:
    asegurar_tabla_historico(db)

    liga = db.execute(
        text("SELECT id_liga, nombre FROM liga WHERE id_liga = :id_liga"),
        {"id_liga": id_liga},
    ).mappings().first()

    if not liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La liga indicada no existe",
        )

    filas = db.execute(
        text(
            """
            WITH totales AS (
                SELECT
                    lm.id_liga_miembro,
                    lm.id_usuario,
                    u.nombre_completo AS nombre_usuario,
                    lm.nombre_equipo,
                    COALESCE(SUM(p.puntos), 0)::INT AS puntos,
                    COALESCE(SUM(CASE WHEN p.acerto_marcador THEN 1 ELSE 0 END), 0)::INT
                        AS aciertos_exactos,
                    COALESCE(SUM(CASE WHEN p.acerto_resultado THEN 1 ELSE 0 END), 0)::INT
                        AS aciertos_resultado
                FROM liga_miembro lm
                JOIN usuario u ON u.id_usuario = lm.id_usuario
                LEFT JOIN vaticinio v ON v.id_liga_miembro = lm.id_liga_miembro
                LEFT JOIN puntaje p ON p.id_vaticinio = v.id_vaticinio
                WHERE lm.id_liga = :id_liga
                  AND lm.estado_membresia = 'activo'
                GROUP BY lm.id_liga_miembro, lm.id_usuario, u.nombre_completo, lm.nombre_equipo
            ),
            ranking AS (
                SELECT
                    ROW_NUMBER() OVER (
                        ORDER BY puntos DESC, aciertos_exactos DESC, aciertos_resultado DESC, nombre_equipo ASC
                    )::INT AS posicion,
                    *
                FROM totales
            ),
            ultimo_historico AS (
                SELECT DISTINCT ON (id_liga_miembro)
                    id_liga_miembro,
                    posicion_actual AS posicion_anterior
                FROM clasificacion_historico
                WHERE id_liga = :id_liga
                ORDER BY id_liga_miembro, fecha_calculo DESC, id_historico DESC
            )
            SELECT
                r.posicion,
                r.id_liga_miembro,
                r.id_usuario,
                r.nombre_usuario,
                r.nombre_equipo,
                r.puntos,
                r.aciertos_exactos,
                r.aciertos_resultado,
                uh.posicion_anterior,
                COALESCE(uh.posicion_anterior - r.posicion, 0)::INT AS movimiento
            FROM ranking r
            LEFT JOIN ultimo_historico uh ON uh.id_liga_miembro = r.id_liga_miembro
            ORDER BY r.posicion
            """
        ),
        {"id_liga": id_liga},
    ).mappings().all()

    return {
        "id_liga": liga["id_liga"],
        "nombre_liga": liga["nombre"],
        "total_miembros": len(filas),
        "fecha_calculo": datetime.now(timezone.utc),
        "clasificacion": [dict(fila) for fila in filas],
    }


def obtener_historico_clasificacion(db: Session, id_liga: int) -> list[dict]:
    asegurar_tabla_historico(db)

    existe_liga = db.execute(
        text("SELECT 1 FROM liga WHERE id_liga = :id_liga"),
        {"id_liga": id_liga},
    ).first()

    if not existe_liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La liga indicada no existe",
        )

    filas = db.execute(
        text(
            """
            SELECT
                ch.id_historico,
                ch.id_liga,
                ch.id_liga_miembro,
                ch.id_partido,
                u.nombre_completo AS nombre_usuario,
                lm.nombre_equipo,
                ch.posicion_anterior,
                ch.posicion_actual,
                ch.puntos_acumulados,
                ch.fecha_calculo
            FROM clasificacion_historico ch
            JOIN liga_miembro lm ON lm.id_liga_miembro = ch.id_liga_miembro
            JOIN usuario u ON u.id_usuario = lm.id_usuario
            WHERE ch.id_liga = :id_liga
            ORDER BY ch.fecha_calculo DESC, ch.posicion_actual ASC
            """
        ),
        {"id_liga": id_liga},
    ).mappings().all()

    return [dict(fila) for fila in filas]


def _existe_tabla_resultado_oficial(db: Session) -> bool:
    return bool(
        db.execute(text("SELECT to_regclass('public.resultado_oficial')")).scalar()
    )


def recalcular_clasificacion_liga(
    db: Session,
    id_liga: int,
    id_partido: int | None = None,
) -> dict:
    asegurar_tabla_historico(db)

    existe_liga = db.execute(
        text("SELECT 1 FROM liga WHERE id_liga = :id_liga"),
        {"id_liga": id_liga},
    ).first()

    if not existe_liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La liga indicada no existe",
        )

    actualizados = 0
    if _existe_tabla_resultado_oficial(db):
        filtro_partido = "AND v.id_partido = :id_partido" if id_partido is not None else ""
        actualizados = db.execute(
            text(
                f"""
                INSERT INTO puntaje (
                    id_vaticinio,
                    puntos,
                    acerto_resultado,
                    acerto_marcador,
                    fecha_calculo
                )
                SELECT
                    v.id_vaticinio,
                    CASE
                        WHEN v.goles_local_pred = ro.goles_local
                         AND v.goles_visitante_pred = ro.goles_visitante
                            THEN :puntos_exactos
                        WHEN SIGN(v.goles_local_pred - v.goles_visitante_pred)
                           = SIGN(ro.goles_local - ro.goles_visitante)
                            THEN :puntos_resultado
                        ELSE 0
                    END AS puntos,
                    (
                        SIGN(v.goles_local_pred - v.goles_visitante_pred)
                        = SIGN(ro.goles_local - ro.goles_visitante)
                    ) AS acerto_resultado,
                    (
                        v.goles_local_pred = ro.goles_local
                        AND v.goles_visitante_pred = ro.goles_visitante
                    ) AS acerto_marcador,
                    NOW()
                FROM vaticinio v
                JOIN liga_miembro lm ON lm.id_liga_miembro = v.id_liga_miembro
                JOIN resultado_oficial ro ON ro.id_partido = v.id_partido
                WHERE lm.id_liga = :id_liga
                  {filtro_partido}
                ON CONFLICT (id_vaticinio) DO UPDATE SET
                    puntos = EXCLUDED.puntos,
                    acerto_resultado = EXCLUDED.acerto_resultado,
                    acerto_marcador = EXCLUDED.acerto_marcador,
                    fecha_calculo = NOW()
                """
            ),
            {
                "id_liga": id_liga,
                "id_partido": id_partido,
                "puntos_exactos": PUNTOS_MARCADOR_EXACTO,
                "puntos_resultado": PUNTOS_RESULTADO,
            },
        ).rowcount

    filas_actuales = obtener_clasificacion_liga(db, id_liga)["clasificacion"]
    fecha_calculo = datetime.now(timezone.utc)

    historicos_creados = 0
    for fila in filas_actuales:
        db.execute(
            text(
                """
                INSERT INTO clasificacion_historico (
                    id_liga,
                    id_liga_miembro,
                    id_partido,
                    posicion_anterior,
                    posicion_actual,
                    puntos_acumulados,
                    fecha_calculo
                )
                VALUES (
                    :id_liga,
                    :id_liga_miembro,
                    :id_partido,
                    :posicion_anterior,
                    :posicion_actual,
                    :puntos_acumulados,
                    :fecha_calculo
                )
                """
            ),
            {
                "id_liga": id_liga,
                "id_liga_miembro": fila["id_liga_miembro"],
                "id_partido": id_partido,
                "posicion_anterior": fila["posicion_anterior"],
                "posicion_actual": fila["posicion"],
                "puntos_acumulados": fila["puntos"],
                "fecha_calculo": fecha_calculo,
            },
        )
        historicos_creados += 1

    db.commit()

    return {
        "mensaje": "Clasificacion recalculada correctamente",
        "id_liga": id_liga,
        "registros_actualizados": actualizados,
        "historicos_creados": historicos_creados,
        "fecha_calculo": fecha_calculo,
    }
