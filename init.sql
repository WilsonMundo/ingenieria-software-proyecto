-- ============================================================
-- INIT.SQL - Proyecto Principal (Liga Mundial)
--
-- Esquema completo para levantar una base limpia del proyecto.
-- Incluye:
--   - Tablas de autenticacion, ligas e invitaciones.
--   - Tablas del modulo mundial: torneo, fases, grupos, sedes,
--     estadios, paises/equipos, partidos y resultados.
--   - Tablas de vaticinios, puntajes, clasificacion, premios y
--     auditoria.
--   - Datos demo basicos para probar login, ligas y mundial.
--
-- IMPORTANTE:
-- Este archivo elimina y recrea tablas. No ejecutarlo sobre una
-- base con datos importantes.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- LIMPIEZA
-- ============================================================
DROP TABLE IF EXISTS audit_log                 CASCADE;
DROP TABLE IF EXISTS distribucion_premio       CASCADE;
DROP TABLE IF EXISTS cierre_liga               CASCADE;
DROP TABLE IF EXISTS premio                    CASCADE;
DROP TABLE IF EXISTS clasificacion_historico   CASCADE;
DROP TABLE IF EXISTS puntaje                   CASCADE;
DROP TABLE IF EXISTS vaticinio                 CASCADE;
DROP TABLE IF EXISTS resultado_oficial         CASCADE;
DROP TABLE IF EXISTS partido                   CASCADE;
DROP TABLE IF EXISTS pais_grupo                CASCADE;
DROP TABLE IF EXISTS pais                      CASCADE;
DROP TABLE IF EXISTS estadio                   CASCADE;
DROP TABLE IF EXISTS sede                      CASCADE;
DROP TABLE IF EXISTS grupo                     CASCADE;
DROP TABLE IF EXISTS fase                      CASCADE;
DROP TABLE IF EXISTS torneo                    CASCADE;
DROP TABLE IF EXISTS password_reset_token      CASCADE;
DROP TABLE IF EXISTS user_sessions             CASCADE;
DROP TABLE IF EXISTS invitacion_liga           CASCADE;
DROP TABLE IF EXISTS solicitud_ingreso         CASCADE;
DROP TABLE IF EXISTS liga_miembro              CASCADE;
DROP TABLE IF EXISTS liga                      CASCADE;
DROP TABLE IF EXISTS usuario                   CASCADE;
DROP TABLE IF EXISTS rol                       CASCADE;

DROP FUNCTION IF EXISTS fn_audit_log() CASCADE;
DROP FUNCTION IF EXISTS fn_recalcular_puntajes_partido(INT) CASCADE;
DROP FUNCTION IF EXISTS fn_guardar_clasificacion_partido(INT) CASCADE;
DROP FUNCTION IF EXISTS trg_resultado_actualiza_clasificacion_fn() CASCADE;
DROP FUNCTION IF EXISTS trg_vaticinio_actualiza_clasificacion_fn() CASCADE;

-- ============================================================
-- AUTENTICACION Y LIGAS
-- ============================================================
CREATE TABLE rol (
    id_rol      SERIAL       PRIMARY KEY,
    nombre_rol  VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    estado      BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE usuario (
    id_usuario      SERIAL       PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'activo',
    id_rol          INT          NOT NULL REFERENCES rol(id_rol),
    fecha_creacion  TIMESTAMPTZ  DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE liga (
    id_liga              SERIAL        PRIMARY KEY,
    nombre               VARCHAR(100)  NOT NULL UNIQUE,
    tipo_liga            VARCHAR(20)   NOT NULL,
    modalidad_liga       VARCHAR(30)   NOT NULL DEFAULT 'diversion',
    precio_participacion NUMERIC(10,2) DEFAULT 0.00,
    id_creador_usuario   INT           NOT NULL REFERENCES usuario(id_usuario),
    id_admin_usuario     INT           NOT NULL REFERENCES usuario(id_usuario),
    estado               VARCHAR(20)   NOT NULL DEFAULT 'activa',
    fecha_creacion       TIMESTAMPTZ   DEFAULT NOW(),
    CONSTRAINT ck_liga_modalidad CHECK (modalidad_liga IN ('diversion', 'apuesta'))
);

CREATE TABLE liga_miembro (
    id_liga_miembro  SERIAL       PRIMARY KEY,
    id_liga          INT          NOT NULL REFERENCES liga(id_liga),
    id_usuario       INT          NOT NULL REFERENCES usuario(id_usuario),
    nombre_equipo    VARCHAR(50)  NOT NULL,
    rol_liga         VARCHAR(20)  NOT NULL,
    estado_membresia VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_union      DATE         NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT uq_liga_usuario       UNIQUE (id_liga, id_usuario),
    CONSTRAINT uq_liga_nombre_equipo UNIQUE (id_liga, nombre_equipo)
);

CREATE TABLE invitacion_liga (
    id_invitacion SERIAL       PRIMARY KEY,
    id_liga       INT          NOT NULL REFERENCES liga(id_liga),
    email_destino VARCHAR(120) NOT NULL,
    token         VARCHAR(150) NOT NULL UNIQUE,
    fecha_envio   TIMESTAMPTZ  DEFAULT NOW(),
    estado        VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
);

CREATE TABLE solicitud_ingreso (
    id_solicitud     SERIAL       PRIMARY KEY,
    id_liga          INT          NOT NULL REFERENCES liga(id_liga),
    id_usuario       INT          NOT NULL REFERENCES usuario(id_usuario),
    estado           VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
    fecha_solicitud  TIMESTAMPTZ  DEFAULT NOW(),
    fecha_resolucion TIMESTAMPTZ
);

CREATE TABLE password_reset_token (
    id_reset_token  SERIAL       PRIMARY KEY,
    id_usuario      INT          NOT NULL REFERENCES usuario(id_usuario),
    token           VARCHAR(150) NOT NULL UNIQUE,
    usado           BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_creacion  TIMESTAMPTZ  DEFAULT NOW(),
    fecha_expiracion TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_sessions (
    id_session       SERIAL       PRIMARY KEY,
    id_usuario       INT          NOT NULL REFERENCES usuario(id_usuario),
    estado           VARCHAR(20)  NOT NULL DEFAULT 'activa',
    access_token     TEXT,
    refresh_token    TEXT         NOT NULL UNIQUE,
    fecha_creacion   TIMESTAMPTZ  DEFAULT NOW(),
    fecha_expiracion TIMESTAMPTZ  NOT NULL,
    revocada         BOOLEAN      NOT NULL DEFAULT FALSE,
    ip_address       VARCHAR(50),
    user_agent       TEXT
);

-- ============================================================
-- MODULO MUNDIAL
-- ============================================================
CREATE TABLE torneo (
    id_torneo SERIAL       PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    anio      INT          NOT NULL,
    estado    VARCHAR(20)  NOT NULL
);

CREATE TABLE fase (
    id_fase    SERIAL      PRIMARY KEY,
    id_torneo  INT         NOT NULL REFERENCES torneo(id_torneo),
    nombre     VARCHAR(50) NOT NULL,
    orden_fase INT         NOT NULL
);

CREATE TABLE grupo (
    id_grupo  SERIAL      PRIMARY KEY,
    id_torneo INT         NOT NULL REFERENCES torneo(id_torneo),
    nombre    VARCHAR(20) NOT NULL
);

CREATE TABLE sede (
    id_sede   SERIAL       PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    ciudad    VARCHAR(100) NOT NULL,
    pais_sede VARCHAR(100) NOT NULL
);

CREATE TABLE estadio (
    id_estadio SERIAL       PRIMARY KEY,
    id_sede    INT          NOT NULL REFERENCES sede(id_sede),
    nombre     VARCHAR(100) NOT NULL,
    capacidad  INT
);

CREATE TABLE pais (
    id_pais       SERIAL       PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    codigo_fifa   CHAR(3)      NOT NULL UNIQUE,
    confederacion VARCHAR(50),
    id_grupo      INT          REFERENCES grupo(id_grupo)
);

CREATE TABLE pais_grupo (
    id_pais_grupo    INT         GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    id_pais          INT         NOT NULL REFERENCES pais(id_pais) ON UPDATE CASCADE ON DELETE CASCADE,
    id_grupo         INT         NOT NULL REFERENCES grupo(id_grupo) ON UPDATE CASCADE ON DELETE CASCADE,
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pais_grupo UNIQUE (id_pais, id_grupo),
    CONSTRAINT uq_grupo_pais UNIQUE (id_grupo, id_pais)
);

CREATE TABLE partido (
    id_partido           SERIAL      PRIMARY KEY,
    id_torneo            INT         NOT NULL REFERENCES torneo(id_torneo),
    id_fase              INT         NOT NULL REFERENCES fase(id_fase),
    id_grupo             INT         REFERENCES grupo(id_grupo),
    id_estadio           INT         NOT NULL REFERENCES estadio(id_estadio),
    id_equipo_local      INT         NOT NULL REFERENCES pais(id_pais),
    id_equipo_visitante  INT         NOT NULL REFERENCES pais(id_pais),
    fecha_hora_inicio    TIMESTAMPTZ NOT NULL,
    estado_partido       VARCHAR(20) NOT NULL DEFAULT 'programado',
    CONSTRAINT ck_partido_equipos_distintos CHECK (id_equipo_local <> id_equipo_visitante),
    CONSTRAINT fk_partido_local_pais_grupo
        FOREIGN KEY (id_grupo, id_equipo_local)
        REFERENCES pais_grupo(id_grupo, id_pais)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_partido_visitante_pais_grupo
        FOREIGN KEY (id_grupo, id_equipo_visitante)
        REFERENCES pais_grupo(id_grupo, id_pais)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE resultado_oficial (
    id_resultado    SERIAL      PRIMARY KEY,
    id_partido      INT         NOT NULL UNIQUE REFERENCES partido(id_partido),
    goles_local     INT         NOT NULL,
    goles_visitante INT         NOT NULL,
    fecha_registro  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bloqueado       BOOLEAN     NOT NULL DEFAULT FALSE
);

-- ============================================================
-- VATICINIOS, PUNTAJES Y CLASIFICACION
-- ============================================================
CREATE TABLE vaticinio (
    id_vaticinio         SERIAL      PRIMARY KEY,
    id_liga_miembro      INT         NOT NULL REFERENCES liga_miembro(id_liga_miembro),
    id_partido           INT         NOT NULL REFERENCES partido(id_partido),
    goles_local_pred     INT         NOT NULL CHECK (goles_local_pred >= 0),
    goles_visitante_pred INT         NOT NULL CHECK (goles_visitante_pred >= 0),
    fecha_registro       TIMESTAMPTZ DEFAULT NOW(),
    fecha_modificacion   TIMESTAMPTZ
);

CREATE TABLE puntaje (
    id_puntaje       SERIAL      PRIMARY KEY,
    id_vaticinio     INT         NOT NULL UNIQUE REFERENCES vaticinio(id_vaticinio),
    puntos           INT         NOT NULL DEFAULT 0,
    acerto_resultado BOOLEAN     NOT NULL DEFAULT FALSE,
    acerto_marcador  BOOLEAN     NOT NULL DEFAULT FALSE,
    fecha_calculo    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clasificacion_historico (
    id_historico        SERIAL      PRIMARY KEY,
    id_liga             INT         NOT NULL REFERENCES liga(id_liga) ON DELETE CASCADE,
    id_liga_miembro     INT         NOT NULL REFERENCES liga_miembro(id_liga_miembro) ON DELETE CASCADE,
    id_partido          INT         NOT NULL REFERENCES partido(id_partido) ON DELETE CASCADE,
    posicion_anterior   INT,
    posicion_actual     INT         NOT NULL,
    puntos_acumulados   INT         NOT NULL DEFAULT 0,
    aciertos_exactos    INT         NOT NULL DEFAULT 0,
    aciertos_resultado  INT         NOT NULL DEFAULT 0,
    movimiento          INT         NOT NULL DEFAULT 0,
    fecha_calculo       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_clasificacion_historico UNIQUE (id_liga, id_liga_miembro, id_partido),
    CONSTRAINT chk_clasificacion_posicion_actual CHECK (posicion_actual > 0),
    CONSTRAINT chk_clasificacion_posicion_anterior CHECK (posicion_anterior IS NULL OR posicion_anterior > 0),
    CONSTRAINT chk_clasificacion_puntos_acumulados CHECK (puntos_acumulados >= 0),
    CONSTRAINT chk_clasificacion_aciertos_exactos CHECK (aciertos_exactos >= 0),
    CONSTRAINT chk_clasificacion_aciertos_resultado CHECK (aciertos_resultado >= 0)
);

-- ============================================================
-- PREMIOS Y AUDITORIA
-- ============================================================
CREATE TABLE cierre_liga (
    id_cierre_liga     SERIAL         PRIMARY KEY,
    id_liga            INT            NOT NULL UNIQUE REFERENCES liga(id_liga) ON DELETE RESTRICT,
    total_recaudado    NUMERIC(12,2)  NOT NULL DEFAULT 0,
    comision           NUMERIC(12,2)  NOT NULL DEFAULT 0,
    fondo_global       NUMERIC(12,2)  NOT NULL DEFAULT 0,
    monto_neto         NUMERIC(12,2)  NOT NULL DEFAULT 0,
    promedio_puntos    NUMERIC(8,2),
    fecha_cierre       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ,
    deleted_by         INT REFERENCES usuario(id_usuario),
    motivo_eliminacion TEXT
);

CREATE TABLE distribucion_premio (
    id_distribucion    SERIAL         PRIMARY KEY,
    id_cierre_liga     INT            NOT NULL REFERENCES cierre_liga(id_cierre_liga) ON DELETE CASCADE,
    posicion_final     SMALLINT       NOT NULL CHECK (posicion_final > 0),
    porcentaje         NUMERIC(5,2)   NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    monto              NUMERIC(12,2)  NOT NULL DEFAULT 0,
    descripcion        TEXT,
    deleted_at         TIMESTAMPTZ,
    deleted_by         INT REFERENCES usuario(id_usuario),
    motivo_eliminacion TEXT,
    CONSTRAINT uq_posicion_cierre UNIQUE (id_cierre_liga, posicion_final)
);

CREATE TABLE premio (
    id_premio          SERIAL         PRIMARY KEY,
    id_liga            INT            NOT NULL REFERENCES liga(id_liga) ON DELETE RESTRICT,
    id_usuario         INT            NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    tipo_premio        VARCHAR(50)    NOT NULL,
    monto              NUMERIC(12,2)  NOT NULL DEFAULT 0,
    descripcion        TEXT,
    fecha_asignacion   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ,
    deleted_by         INT REFERENCES usuario(id_usuario),
    motivo_eliminacion TEXT
);

CREATE TABLE audit_log (
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
-- INDICES
-- ============================================================
CREATE INDEX idx_usuario_email                    ON usuario(email);
CREATE INDEX idx_liga_miembro_liga                ON liga_miembro(id_liga);
CREATE INDEX idx_liga_miembro_usuario             ON liga_miembro(id_usuario);
CREATE INDEX idx_invitacion_token                 ON invitacion_liga(token);
CREATE INDEX idx_password_reset_token             ON password_reset_token(token);

CREATE INDEX idx_torneo_anio                      ON torneo(anio);
CREATE INDEX idx_fase_torneo                      ON fase(id_torneo);
CREATE INDEX idx_grupo_torneo                     ON grupo(id_torneo);
CREATE INDEX idx_estadio_sede                     ON estadio(id_sede);
CREATE INDEX idx_pais_grupo                       ON pais(id_grupo);
CREATE INDEX idx_pais_grupo_grupo                 ON pais_grupo(id_grupo);
CREATE INDEX idx_pais_grupo_pais                  ON pais_grupo(id_pais);
CREATE INDEX idx_partido_torneo                   ON partido(id_torneo);
CREATE INDEX idx_partido_grupo                    ON partido(id_grupo);
CREATE INDEX idx_partido_equipos                  ON partido(id_equipo_local, id_equipo_visitante);
CREATE INDEX idx_resultado_partido                ON resultado_oficial(id_partido);

CREATE INDEX idx_vaticinio_liga_miembro           ON vaticinio(id_liga_miembro);
CREATE INDEX idx_vaticinio_partido                ON vaticinio(id_partido);
CREATE INDEX idx_puntaje_vaticinio                ON puntaje(id_vaticinio);
CREATE INDEX idx_clasificacion_historico_liga     ON clasificacion_historico(id_liga);
CREATE INDEX idx_clasificacion_historico_miembro  ON clasificacion_historico(id_liga_miembro);
CREATE INDEX idx_clasificacion_historico_partido  ON clasificacion_historico(id_partido);
CREATE INDEX idx_clasificacion_historico_fecha    ON clasificacion_historico(fecha_calculo);

CREATE INDEX idx_audit_log_fecha_evento           ON audit_log(fecha_evento DESC);
CREATE INDEX idx_audit_log_tabla                  ON audit_log(tabla_afectada);
CREATE INDEX idx_audit_log_operacion              ON audit_log(operacion);

-- ============================================================
-- FUNCIONES Y TRIGGERS DE AUDITORIA
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

CREATE TRIGGER trg_audit_liga
    AFTER INSERT OR UPDATE OR DELETE ON liga
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_premio
    AFTER INSERT OR UPDATE OR DELETE ON premio
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_cierre_liga
    AFTER INSERT OR UPDATE OR DELETE ON cierre_liga
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_distribucion_premio
    AFTER INSERT OR UPDATE OR DELETE ON distribucion_premio
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ============================================================
-- FUNCIONES Y TRIGGERS DE CLASIFICACION
-- ============================================================
CREATE OR REPLACE FUNCTION fn_recalcular_puntajes_partido(p_id_partido INT)
RETURNS VOID AS $$
BEGIN
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
                THEN 3
            WHEN SIGN(v.goles_local_pred - v.goles_visitante_pred)
               = SIGN(ro.goles_local - ro.goles_visitante)
                THEN 1
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
    JOIN resultado_oficial ro
        ON ro.id_partido = v.id_partido
    WHERE v.id_partido = p_id_partido
    ON CONFLICT (id_vaticinio) DO UPDATE SET
        puntos = EXCLUDED.puntos,
        acerto_resultado = EXCLUDED.acerto_resultado,
        acerto_marcador = EXCLUDED.acerto_marcador,
        fecha_calculo = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_guardar_clasificacion_partido(p_id_partido INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO clasificacion_historico (
        id_liga,
        id_liga_miembro,
        id_partido,
        posicion_anterior,
        posicion_actual,
        puntos_acumulados,
        aciertos_exactos,
        aciertos_resultado,
        movimiento,
        fecha_calculo
    )
    WITH ligas_afectadas AS (
        SELECT DISTINCT lm.id_liga
        FROM vaticinio v
        JOIN liga_miembro lm
            ON lm.id_liga_miembro = v.id_liga_miembro
        WHERE v.id_partido = p_id_partido
    ),
    totales AS (
        SELECT
            lm.id_liga,
            lm.id_liga_miembro,
            COALESCE(SUM(p.puntos), 0)::INT AS puntos_acumulados,
            COALESCE(SUM(CASE WHEN p.acerto_marcador THEN 1 ELSE 0 END), 0)::INT AS aciertos_exactos,
            COALESCE(SUM(CASE WHEN p.acerto_resultado THEN 1 ELSE 0 END), 0)::INT AS aciertos_resultado
        FROM liga_miembro lm
        JOIN ligas_afectadas la
            ON la.id_liga = lm.id_liga
        LEFT JOIN vaticinio v
            ON v.id_liga_miembro = lm.id_liga_miembro
        LEFT JOIN puntaje p
            ON p.id_vaticinio = v.id_vaticinio
        WHERE lm.estado_membresia = 'activo'
        GROUP BY lm.id_liga, lm.id_liga_miembro
    ),
    ranking AS (
        SELECT
            ROW_NUMBER() OVER (
                PARTITION BY t.id_liga
                ORDER BY
                    t.puntos_acumulados DESC,
                    t.aciertos_exactos DESC,
                    t.aciertos_resultado DESC,
                    t.id_liga_miembro ASC
            )::INT AS posicion_actual,
            t.*
        FROM totales t
    ),
    anterior AS (
        SELECT DISTINCT ON (ch.id_liga_miembro)
            ch.id_liga_miembro,
            ch.posicion_actual AS posicion_anterior
        FROM clasificacion_historico ch
        WHERE ch.id_partido <> p_id_partido
          AND ch.id_liga IN (SELECT id_liga FROM ligas_afectadas)
        ORDER BY ch.id_liga_miembro, ch.fecha_calculo DESC, ch.id_historico DESC
    )
    SELECT
        r.id_liga,
        r.id_liga_miembro,
        p_id_partido,
        a.posicion_anterior,
        r.posicion_actual,
        r.puntos_acumulados,
        r.aciertos_exactos,
        r.aciertos_resultado,
        COALESCE(a.posicion_anterior - r.posicion_actual, 0)::INT AS movimiento,
        NOW()
    FROM ranking r
    LEFT JOIN anterior a
        ON a.id_liga_miembro = r.id_liga_miembro
    ON CONFLICT (id_liga, id_liga_miembro, id_partido) DO UPDATE SET
        posicion_anterior = EXCLUDED.posicion_anterior,
        posicion_actual = EXCLUDED.posicion_actual,
        puntos_acumulados = EXCLUDED.puntos_acumulados,
        aciertos_exactos = EXCLUDED.aciertos_exactos,
        aciertos_resultado = EXCLUDED.aciertos_resultado,
        movimiento = EXCLUDED.movimiento,
        fecha_calculo = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_resultado_actualiza_clasificacion_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM fn_recalcular_puntajes_partido(NEW.id_partido);
    PERFORM fn_guardar_clasificacion_partido(NEW.id_partido);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_resultado_actualiza_clasificacion
AFTER INSERT OR UPDATE OF goles_local, goles_visitante
ON resultado_oficial
FOR EACH ROW
EXECUTE FUNCTION trg_resultado_actualiza_clasificacion_fn();

CREATE OR REPLACE FUNCTION trg_vaticinio_actualiza_clasificacion_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM resultado_oficial ro
        WHERE ro.id_partido = NEW.id_partido
    ) THEN
        PERFORM fn_recalcular_puntajes_partido(NEW.id_partido);
        PERFORM fn_guardar_clasificacion_partido(NEW.id_partido);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vaticinio_actualiza_clasificacion
AFTER INSERT OR UPDATE OF goles_local_pred, goles_visitante_pred, id_partido, id_liga_miembro
ON vaticinio
FOR EACH ROW
EXECUTE FUNCTION trg_vaticinio_actualiza_clasificacion_fn();

-- ============================================================
-- DATOS DEMO
-- ============================================================
INSERT INTO rol (nombre_rol, descripcion, estado) VALUES
('administrador', 'Administrador global del sistema', TRUE),
('jugador',       'Usuario participante en ligas',    TRUE);

-- Usuarios:
--   admin@liga.com  -> Admin123!
--   jugadores       -> Player123!
INSERT INTO usuario (nombre_completo, email, password_hash, estado, id_rol) VALUES
('Admin Sistema',  'admin@liga.com',  '$2b$12$b2Aoi4WRwyyPEoEiR6qyiOBwefDOKJKMT7RxqKKApJlNkWq3yZBY2', 'activo', 1),
('Carlos Lopez',   'carlos@liga.com', '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2),
('Maria Gomez',    'maria@liga.com',  '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2),
('Luis Martinez',  'luis@liga.com',   '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2),
('Ana Torres',     'ana@liga.com',    '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2);

INSERT INTO torneo (nombre, anio, estado) VALUES
('Mundial 2026', 2026, 'activo');

INSERT INTO fase (id_torneo, nombre, orden_fase) VALUES
(1, 'Fase de grupos', 1),
(1, 'Dieciseisavos', 2),
(1, 'Octavos de final', 3),
(1, 'Cuartos de final', 4),
(1, 'Semifinal', 5),
(1, 'Final', 6);

INSERT INTO grupo (id_torneo, nombre) VALUES
(1, 'Grupo A'),
(1, 'Grupo B'),
(1, 'Grupo C'),
(1, 'Grupo D'),
(1, 'Grupo E'),
(1, 'Grupo F'),
(1, 'Grupo G'),
(1, 'Grupo H'),
(1, 'Grupo I'),
(1, 'Grupo J'),
(1, 'Grupo K'),
(1, 'Grupo L');

INSERT INTO sede (nombre, ciudad, pais_sede) VALUES
('Sede Atlanta', 'Atlanta', 'Estados Unidos'),
('Sede Boston', 'Boston', 'Estados Unidos'),
('Sede Dallas', 'Dallas', 'Estados Unidos'),
('Sede Guadalajara', 'Guadalajara', 'Mexico'),
('Sede Houston', 'Houston', 'Estados Unidos'),
('Sede Kansas City', 'Kansas City', 'Estados Unidos'),
('Sede Los Angeles', 'Los Angeles', 'Estados Unidos'),
('Sede Mexico City', 'Mexico City', 'Mexico'),
('Sede Miami', 'Miami', 'Estados Unidos'),
('Sede Monterrey', 'Monterrey', 'Mexico'),
('Sede New York/New Jersey', 'New York/New Jersey', 'Estados Unidos'),
('Sede Philadelphia', 'Philadelphia', 'Estados Unidos'),
('Sede San Francisco Bay Area', 'San Francisco Bay Area', 'Estados Unidos'),
('Sede Seattle', 'Seattle', 'Estados Unidos'),
('Sede Toronto', 'Toronto', 'Canada'),
('Sede Vancouver', 'Vancouver', 'Canada');

INSERT INTO estadio (id_sede, nombre, capacidad) VALUES
(1, 'Estadio Atlanta', 71000),
(2, 'Estadio Boston', 65000),
(3, 'Estadio Dallas', 80000),
(4, 'Estadio Guadalajara', 48000),
(5, 'Estadio Houston', 72000),
(6, 'Estadio Kansas City', 76000),
(7, 'Estadio Los Angeles', 70000),
(8, 'Estadio Mexico City', 83000),
(9, 'Estadio Miami', 65000),
(10, 'Estadio Monterrey', 53000),
(11, 'Estadio New York/New Jersey', 82000),
(12, 'Estadio Philadelphia', 69000),
(13, 'Estadio San Francisco Bay Area', 68000),
(14, 'Estadio Seattle', 69000),
(15, 'Estadio Toronto', 30000),
(16, 'Estadio Vancouver', 54000);

-- En el backend, "equipo" se representa con la tabla pais.
INSERT INTO pais (nombre, codigo_fifa, confederacion, id_grupo) VALUES
('Mexico', 'MEX', 'CONCACAF', 1),
('Canada', 'CAN', 'CONCACAF', 1),
('Estados Unidos', 'USA', 'CONCACAF', 1),
('Brasil', 'BRA', 'CONMEBOL', 1),
('Argentina', 'ARG', 'CONMEBOL', 2),
('Uruguay', 'URU', 'CONMEBOL', 2),
('Colombia', 'COL', 'CONMEBOL', 2),
('Ecuador', 'ECU', 'CONMEBOL', 2),
('Paraguay', 'PAR', 'CONMEBOL', 3),
('Chile', 'CHI', 'CONMEBOL', 3),
('Peru', 'PER', 'CONMEBOL', 3),
('Bolivia', 'BOL', 'CONMEBOL', 3),
('Inglaterra', 'ENG', 'UEFA', 4),
('Francia', 'FRA', 'UEFA', 4),
('Alemania', 'GER', 'UEFA', 4),
('Espana', 'ESP', 'UEFA', 4),
('Portugal', 'POR', 'UEFA', 5),
('Paises Bajos', 'NED', 'UEFA', 5),
('Belgica', 'BEL', 'UEFA', 5),
('Croacia', 'CRO', 'UEFA', 5),
('Italia', 'ITA', 'UEFA', 6),
('Suiza', 'SUI', 'UEFA', 6),
('Dinamarca', 'DEN', 'UEFA', 6),
('Serbia', 'SRB', 'UEFA', 6),
('Marruecos', 'MAR', 'CAF', 7),
('Senegal', 'SEN', 'CAF', 7),
('Nigeria', 'NGA', 'CAF', 7),
('Egipto', 'EGY', 'CAF', 7),
('Tunez', 'TUN', 'CAF', 8),
('Argelia', 'ALG', 'CAF', 8),
('Ghana', 'GHA', 'CAF', 8),
('Camerun', 'CMR', 'CAF', 8),
('Sudafrica', 'RSA', 'CAF', 9),
('Japon', 'JPN', 'AFC', 9),
('Corea del Sur', 'KOR', 'AFC', 9),
('Iran', 'IRN', 'AFC', 9),
('Arabia Saudita', 'KSA', 'AFC', 10),
('Australia', 'AUS', 'AFC', 10),
('Qatar', 'QAT', 'AFC', 10),
('Emiratos Arabes Unidos', 'UAE', 'AFC', 10),
('China', 'CHN', 'AFC', 11),
('Uzbekistan', 'UZB', 'AFC', 11),
('Nueva Zelanda', 'NZL', 'OFC', 11),
('Costa Rica', 'CRC', 'CONCACAF', 11),
('Panama', 'PAN', 'CONCACAF', 12),
('Jamaica', 'JAM', 'CONCACAF', 12),
('Honduras', 'HON', 'CONCACAF', 12),
('Guatemala', 'GUA', 'CONCACAF', 12);

INSERT INTO pais_grupo (id_pais, id_grupo)
SELECT id_pais, id_grupo
FROM pais
WHERE id_grupo IS NOT NULL
ON CONFLICT (id_pais, id_grupo) DO NOTHING;

INSERT INTO partido (
    id_torneo,
    id_fase,
    id_grupo,
    id_estadio,
    id_equipo_local,
    id_equipo_visitante,
    fecha_hora_inicio,
    estado_partido
) VALUES
(1, 1, 1, 8, 1, 2, '2026-06-11 18:00:00+00', 'programado'),
(1, 1, 1, 7, 3, 4, '2026-06-12 20:00:00+00', 'programado'),
(1, 1, 2, 11, 5, 6, '2026-06-13 20:00:00+00', 'programado');

INSERT INTO liga (nombre, tipo_liga, modalidad_liga, precio_participacion,
                  id_creador_usuario, id_admin_usuario, estado) VALUES
('Liga Apuesta Demo', 'privada', 'apuesta', 500.00, 1, 1, 'activa'),
('Liga Diversion Demo', 'publica', 'diversion', 0.00, 1, 1, 'activa');

INSERT INTO liga_miembro (id_liga, id_usuario, nombre_equipo, rol_liga, estado_membresia) VALUES
(1, 2, 'Equipo Carlos', 'participante', 'activo'),
(1, 3, 'Equipo Maria',  'participante', 'activo'),
(1, 4, 'Equipo Luis',   'participante', 'activo'),
(1, 5, 'Equipo Ana',    'participante', 'activo');

INSERT INTO vaticinio (id_liga_miembro, id_partido, goles_local_pred, goles_visitante_pred) VALUES
(1, 1, 2, 1),
(2, 1, 1, 1),
(3, 1, 0, 0),
(4, 1, 3, 2);

-- Puntajes demo para probar clasificacion y premios sin depender de
-- resultados oficiales cargados.
INSERT INTO puntaje (id_vaticinio, puntos, acerto_resultado, acerto_marcador) VALUES
(1, 9, TRUE,  TRUE),
(2, 6, TRUE,  FALSE),
(3, 3, TRUE,  FALSE),
(4, 1, FALSE, FALSE);

-- ============================================================
-- SINCRONIZACION DE SECUENCIAS
-- ============================================================
DO $$
DECLARE
    r RECORD;
    max_id BIGINT;
BEGIN
    FOR r IN
        SELECT
            quote_ident(seq_ns.nspname) || '.' || quote_ident(seq.relname) AS sequence_name,
            quote_ident(tab_ns.nspname) || '.' || quote_ident(tab.relname) AS table_name,
            quote_ident(att.attname) AS column_name
        FROM pg_class seq
        JOIN pg_namespace seq_ns ON seq_ns.oid = seq.relnamespace
        JOIN pg_depend dep ON dep.objid = seq.oid AND dep.deptype IN ('a', 'i')
        JOIN pg_class tab ON tab.oid = dep.refobjid
        JOIN pg_namespace tab_ns ON tab_ns.oid = tab.relnamespace
        JOIN pg_attribute att ON att.attrelid = tab.oid AND att.attnum = dep.refobjsubid
        WHERE seq.relkind = 'S'
          AND tab_ns.nspname = 'public'
    LOOP
        EXECUTE format('SELECT COALESCE(MAX(%s), 0) FROM %s', r.column_name, r.table_name)
        INTO max_id;

        EXECUTE format(
            'SELECT setval(%L::regclass, %s, %L)',
            r.sequence_name,
            GREATEST(max_id, 1),
            max_id > 0
        );
    END LOOP;
END $$;

-- ============================================================
-- FIN INIT.SQL
-- ============================================================
