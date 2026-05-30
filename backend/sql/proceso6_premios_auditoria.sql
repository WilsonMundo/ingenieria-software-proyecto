-- ============================================================
-- PROCESO 6 - Premios, Auditoria y Panel Global
-- Modulos: M6 (Motor de Premios) + M7 (Panel de Administracion)
-- ============================================================
-- Script IDEMPOTENTE: se puede ejecutar varias veces sin error.
-- Agrega lo que el Proceso 6 necesita SOBRE el esquema ya
-- existente del proyecto principal (rol, usuario, liga,
-- liga_miembro, etc.).
--
-- Ejecutar conectado a la base del proyecto principal, por ej:
--   psql -U <usuario> -d <base> -f proceso6_premios_auditoria.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Columna nueva en LIGA: modalidad_liga
--    (diversion = sin dinero / apuesta = con premios monetarios)
-- ============================================================
ALTER TABLE liga
    ADD COLUMN IF NOT EXISTS modalidad_liga VARCHAR(30) NOT NULL DEFAULT 'diversion';

UPDATE liga
SET modalidad_liga = 'apuesta'
WHERE LOWER(tipo_liga) = 'apuesta'
  AND modalidad_liga <> 'apuesta';

-- Restriccion de valores permitidos (solo si aun no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_liga_modalidad'
    ) THEN
        ALTER TABLE liga
            ADD CONSTRAINT ck_liga_modalidad
            CHECK (modalidad_liga IN ('diversion', 'apuesta'));
    END IF;
END $$;

-- ============================================================
-- 2. Tablas de dependencia del motor de premios.
--    El ranking suma puntos desde vaticinio + puntaje.
--    Estas tablas normalmente las crea el proceso de
--    puntajes/vaticinios. Se crean aqui SOLO si no existen,
--    para que el motor de premios pueda demostrarse de forma
--    independiente. Si ya existen, este bloque no hace nada.
-- ============================================================
CREATE TABLE IF NOT EXISTS vaticinio (
    id_vaticinio         SERIAL       PRIMARY KEY,
    id_liga_miembro      INT          NOT NULL REFERENCES liga_miembro(id_liga_miembro) ON DELETE CASCADE,
    id_partido           INT          NOT NULL,
    goles_local_pred     SMALLINT     NOT NULL CHECK (goles_local_pred >= 0),
    goles_visitante_pred SMALLINT     NOT NULL CHECK (goles_visitante_pred >= 0),
    fecha_registro       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    fecha_modificacion   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS puntaje (
    id_puntaje       SERIAL        PRIMARY KEY,
    id_vaticinio     INT           NOT NULL UNIQUE REFERENCES vaticinio(id_vaticinio) ON DELETE CASCADE,
    puntos           NUMERIC(6,2)  NOT NULL DEFAULT 0,
    acerto_resultado BOOLEAN       NOT NULL DEFAULT FALSE,
    acerto_marcador  BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_calculo    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. CIERRE_LIGA: registro economico del cierre de una liga
-- ============================================================
CREATE TABLE IF NOT EXISTS cierre_liga (
    id_cierre_liga  SERIAL         PRIMARY KEY,
    id_liga         INT            NOT NULL UNIQUE REFERENCES liga(id_liga) ON DELETE RESTRICT,
    total_recaudado NUMERIC(12,2)  NOT NULL DEFAULT 0,
    comision        NUMERIC(12,2)  NOT NULL DEFAULT 0,
    fondo_global    NUMERIC(12,2)  NOT NULL DEFAULT 0,
    monto_neto      NUMERIC(12,2)  NOT NULL DEFAULT 0,
    promedio_puntos NUMERIC(8,2),
    fecha_cierre    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. DISTRIBUCION_PREMIO: reparto porcentual por posicion
-- ============================================================
CREATE TABLE IF NOT EXISTS distribucion_premio (
    id_distribucion SERIAL         PRIMARY KEY,
    id_cierre_liga  INT            NOT NULL REFERENCES cierre_liga(id_cierre_liga) ON DELETE CASCADE,
    posicion_final  SMALLINT       NOT NULL CHECK (posicion_final > 0),
    porcentaje      NUMERIC(5,2)   NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    monto           NUMERIC(12,2)  NOT NULL DEFAULT 0,
    descripcion     TEXT,
    CONSTRAINT uq_posicion_cierre UNIQUE (id_cierre_liga, posicion_final)
);

-- ============================================================
-- 5. PREMIO: premios asignados a los usuarios ganadores
-- ============================================================
CREATE TABLE IF NOT EXISTS premio (
    id_premio        SERIAL         PRIMARY KEY,
    id_liga          INT            NOT NULL REFERENCES liga(id_liga) ON DELETE RESTRICT,
    id_usuario       INT            NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    tipo_premio      VARCHAR(50)    NOT NULL,
    monto            NUMERIC(12,2)  NOT NULL DEFAULT 0,
    descripcion      TEXT,
    fecha_asignacion TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. AUDIT_LOG: bitacora de auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id_audit_log     SERIAL       PRIMARY KEY,
    tabla_afectada   VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    id_registro      TEXT,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    usuario_bd       VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,
    fecha_evento     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. SOFT DELETE: conservar trazabilidad sin borrar fisicamente
-- ============================================================
ALTER TABLE premio
    ADD COLUMN IF NOT EXISTS deleted_at          TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by          INT REFERENCES usuario(id_usuario),
    ADD COLUMN IF NOT EXISTS motivo_eliminacion  TEXT;

ALTER TABLE cierre_liga
    ADD COLUMN IF NOT EXISTS deleted_at          TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by          INT REFERENCES usuario(id_usuario),
    ADD COLUMN IF NOT EXISTS motivo_eliminacion  TEXT;

ALTER TABLE distribucion_premio
    ADD COLUMN IF NOT EXISTS deleted_at          TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by          INT REFERENCES usuario(id_usuario),
    ADD COLUMN IF NOT EXISTS motivo_eliminacion  TEXT;

-- ============================================================
-- 8. INDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_fecha_evento ON audit_log(fecha_evento DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla        ON audit_log(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_audit_log_operacion    ON audit_log(operacion);
CREATE INDEX IF NOT EXISTS idx_vaticinio_liga_miembro ON vaticinio(id_liga_miembro);
CREATE INDEX IF NOT EXISTS idx_puntaje_vaticinio      ON puntaje(id_vaticinio);

-- ============================================================
-- 9. FUNCION TRIGGER DE AUDITORIA
-- ============================================================
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    datos_json   JSONB;
    id_detectado TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        datos_json := to_jsonb(NEW);
    ELSE
        datos_json := to_jsonb(OLD);
    END IF;

    id_detectado := CASE TG_TABLE_NAME
        WHEN 'liga'                THEN datos_json ->> 'id_liga'
        WHEN 'premio'              THEN datos_json ->> 'id_premio'
        WHEN 'cierre_liga'         THEN datos_json ->> 'id_cierre_liga'
        WHEN 'distribucion_premio' THEN datos_json ->> 'id_distribucion'
        ELSE (
            SELECT value
            FROM jsonb_each_text(datos_json)
            WHERE key LIKE 'id_%'
            LIMIT 1
        )
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (tabla_afectada, operacion, id_registro,
                               datos_anteriores, datos_nuevos, usuario_bd, fecha_evento)
        VALUES (TG_TABLE_NAME, TG_OP, id_detectado, NULL, to_jsonb(NEW), CURRENT_USER, NOW());
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (tabla_afectada, operacion, id_registro,
                               datos_anteriores, datos_nuevos, usuario_bd, fecha_evento)
        VALUES (TG_TABLE_NAME, TG_OP, id_detectado, to_jsonb(OLD), to_jsonb(NEW), CURRENT_USER, NOW());
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (tabla_afectada, operacion, id_registro,
                               datos_anteriores, datos_nuevos, usuario_bd, fecha_evento)
        VALUES (TG_TABLE_NAME, TG_OP, id_detectado, to_jsonb(OLD), NULL, CURRENT_USER, NOW());
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 10. TRIGGERS sobre tablas criticas
--     (se recrean para ser idempotentes)
-- ============================================================
DROP TRIGGER IF EXISTS trg_audit_premio              ON premio;
CREATE TRIGGER trg_audit_premio
    AFTER INSERT OR UPDATE OR DELETE ON premio
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_cierre_liga         ON cierre_liga;
CREATE TRIGGER trg_audit_cierre_liga
    AFTER INSERT OR UPDATE OR DELETE ON cierre_liga
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_distribucion_premio ON distribucion_premio;
CREATE TRIGGER trg_audit_distribucion_premio
    AFTER INSERT OR UPDATE OR DELETE ON distribucion_premio
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_liga                ON liga;
CREATE TRIGGER trg_audit_liga
    AFTER INSERT OR UPDATE OR DELETE ON liga
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ============================================================
-- FIN PROCESO 6
-- ============================================================
