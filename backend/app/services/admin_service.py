from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError


def asegurar_audit_log(db: Session):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id_audit_log     SERIAL       PRIMARY KEY,
            tabla_afectada   VARCHAR(100) NOT NULL,
            operacion        VARCHAR(10)  NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
            id_registro      TEXT,
            datos_anteriores JSONB,
            datos_nuevos     JSONB,
            usuario_bd       VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,
            fecha_evento     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        )
    """))
    db.execute(text(
        "CREATE INDEX IF NOT EXISTS idx_audit_log_fecha_evento ON audit_log(fecha_evento DESC)"
    ))
    db.execute(text(
        "CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON audit_log(tabla_afectada)"
    ))
    db.execute(text(
        "CREATE INDEX IF NOT EXISTS idx_audit_log_operacion ON audit_log(operacion)"
    ))
    db.commit()


def listar_audit_log(
    db: Session,
    tabla: str | None = None,
    operacion: str | None = None,
    limite: int = 50
):
    asegurar_audit_log(db)

    query = """
        SELECT
            id_audit_log,
            tabla_afectada,
            operacion,
            id_registro,
            datos_anteriores,
            datos_nuevos,
            usuario_bd,
            fecha_evento
        FROM audit_log
        WHERE 1 = 1
    """

    params = {"limite": limite}

    if tabla:
        query += " AND tabla_afectada = :tabla"
        params["tabla"] = tabla

    if operacion:
        query += " AND operacion = :operacion"
        params["operacion"] = operacion

    query += """
        ORDER BY fecha_evento DESC
        LIMIT :limite
    """

    try:
        registros = db.execute(text(query), params).mappings().all()

        return {
            "total": len(registros),
            "items": [dict(row) for row in registros]
        }

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Error al consultar audit_log. "
                "Verifica que la tabla audit_log exista y que los triggers esten creados. "
                f"Detalle tecnico: {str(error)}"
            )
        )


def obtener_dashboard_global(db: Session):
    try:
        resultado = db.execute(
            text("""
                SELECT
                    (SELECT COUNT(*) FROM usuario) AS total_usuarios,
                    (SELECT COUNT(*) FROM liga) AS total_ligas,
                    (SELECT COUNT(*) FROM liga WHERE modalidad_liga = 'apuesta') AS ligas_apuesta,
                    (SELECT COUNT(*) FROM liga WHERE modalidad_liga = 'diversion') AS ligas_diversion,
                    (SELECT COUNT(*) FROM premio WHERE deleted_at IS NULL) AS premios_activos,
                    (SELECT COALESCE(SUM(total_recaudado), 0) FROM cierre_liga WHERE deleted_at IS NULL) AS total_recaudado_global,
                    (SELECT COALESCE(SUM(comision), 0) FROM cierre_liga WHERE deleted_at IS NULL) AS comision_global,
                    (SELECT COALESCE(SUM(fondo_global), 0) FROM cierre_liga WHERE deleted_at IS NULL) AS fondo_global
            """)
        ).mappings().first()

        if not resultado:
            raise HTTPException(
                status_code=404,
                detail="No se pudo generar el dashboard global"
            )

        return dict(resultado)

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar dashboard global: {str(error)}"
        )


def obtener_reporte_actividad(db: Session):
    try:
        asegurar_audit_log(db)

        actividad = db.execute(
            text("""
                SELECT
                    tabla_afectada,
                    operacion,
                    COUNT(*) AS total_eventos,
                    MAX(fecha_evento) AS ultimo_evento
                FROM audit_log
                GROUP BY tabla_afectada, operacion
                ORDER BY ultimo_evento DESC
            """)
        ).mappings().all()

        return {
            "items": [dict(row) for row in actividad]
        }

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Error al generar reporte de actividad. "
                "Verifica que audit_log exista y que tenga registros. "
                f"Detalle tecnico: {str(error)}"
            )
        )
