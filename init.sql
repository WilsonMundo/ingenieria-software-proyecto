-- ============================================================
-- INIT.SQL - Proyecto Principal (Liga Mundial)
-- Esquema que coincide con los modelos SQLAlchemy del backend
-- + Proceso 6 (Premios, Auditoria y Panel Global) + datos demo
--
-- Se ejecuta automaticamente al levantar la base con
-- docker-compose (montado en /docker-entrypoint-initdb.d/).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar en orden inverso de dependencias
DROP TABLE IF EXISTS audit_log            CASCADE;
DROP TABLE IF EXISTS distribucion_premio  CASCADE;
DROP TABLE IF EXISTS cierre_liga          CASCADE;
DROP TABLE IF EXISTS premio               CASCADE;
DROP TABLE IF EXISTS puntaje              CASCADE;
DROP TABLE IF EXISTS vaticinio            CASCADE;
DROP TABLE IF EXISTS user_sessions        CASCADE;
DROP TABLE IF EXISTS invitacion_liga      CASCADE;
DROP TABLE IF EXISTS solicitud_ingreso    CASCADE;
DROP TABLE IF EXISTS liga_miembro         CASCADE;
DROP TABLE IF EXISTS liga                 CASCADE;
DROP TABLE IF EXISTS usuario              CASCADE;
DROP TABLE IF EXISTS rol                  CASCADE;

-- ============================================================
-- TABLAS BASE (coinciden con app/models/*.py del principal)
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

CREATE TABLE user_sessions (
    id_session       SERIAL       PRIMARY KEY,
    id_usuario       INT          NOT NULL REFERENCES usuario(id_usuario),
    access_token     TEXT,
    refresh_token    TEXT         NOT NULL UNIQUE,
    fecha_creacion   TIMESTAMPTZ  DEFAULT NOW(),
    fecha_expiracion TIMESTAMPTZ  NOT NULL,
    revocada         BOOLEAN      NOT NULL DEFAULT FALSE,
    estado           VARCHAR(20)  NOT NULL DEFAULT 'activa',
    ip_address       VARCHAR(50),
    user_agent       TEXT
);

-- ============================================================
-- TABLAS DEL PROCESO 6
-- ============================================================

-- Dependencias del ranking (normalmente las crea el proceso de
-- puntajes/pronosticos; aqui van sin FK a partido para que el
-- motor de premios sea autosuficiente en este entorno de prueba).
CREATE TABLE vaticinio (
    id_vaticinio         SERIAL       PRIMARY KEY,
    id_liga_miembro      INT          NOT NULL REFERENCES liga_miembro(id_liga_miembro) ON DELETE CASCADE,
    id_partido           INT          NOT NULL,
    goles_local_pred     SMALLINT     NOT NULL CHECK (goles_local_pred >= 0),
    goles_visitante_pred SMALLINT     NOT NULL CHECK (goles_visitante_pred >= 0),
    fecha_registro       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    fecha_modificacion   TIMESTAMPTZ
);

CREATE TABLE puntaje (
    id_puntaje       SERIAL        PRIMARY KEY,
    id_vaticinio     INT           NOT NULL UNIQUE REFERENCES vaticinio(id_vaticinio) ON DELETE CASCADE,
    puntos           NUMERIC(6,2)  NOT NULL DEFAULT 0,
    acerto_resultado BOOLEAN       NOT NULL DEFAULT FALSE,
    acerto_marcador  BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_calculo    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

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
CREATE INDEX idx_usuario_email          ON usuario(email);
CREATE INDEX idx_liga_miembro_liga      ON liga_miembro(id_liga);
CREATE INDEX idx_liga_miembro_usuario   ON liga_miembro(id_usuario);
CREATE INDEX idx_vaticinio_liga_miembro ON vaticinio(id_liga_miembro);
CREATE INDEX idx_puntaje_vaticinio      ON puntaje(id_vaticinio);
CREATE INDEX idx_audit_log_fecha_evento ON audit_log(fecha_evento DESC);
CREATE INDEX idx_audit_log_tabla        ON audit_log(tabla_afectada);
CREATE INDEX idx_audit_log_operacion    ON audit_log(operacion);

-- ============================================================
-- FUNCION + TRIGGERS DE AUDITORIA
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
            SELECT value FROM jsonb_each_text(datos_json)
            WHERE key LIKE 'id_%' LIMIT 1
        )
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (tabla_afectada, operacion, id_registro,
                               datos_anteriores, datos_nuevos, usuario_bd, fecha_evento)
        VALUES (TG_TABLE_NAME, TG_OP, id_detectado, NULL, to_jsonb(NEW), CURRENT_USER, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (tabla_afectada, operacion, id_registro,
                               datos_anteriores, datos_nuevos, usuario_bd, fecha_evento)
        VALUES (TG_TABLE_NAME, TG_OP, id_detectado, to_jsonb(OLD), to_jsonb(NEW), CURRENT_USER, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
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
-- DATOS DE PRUEBA
-- ============================================================
-- Roles
INSERT INTO rol (nombre_rol, descripcion, estado) VALUES
('administrador', 'Administrador global del sistema', TRUE),
('jugador',       'Usuario participante en ligas',    TRUE);

-- Usuarios (passwords reales con bcrypt)
--   admin@liga.com  -> Admin123!
--   los jugadores   -> Player123!
INSERT INTO usuario (nombre_completo, email, password_hash, estado, id_rol) VALUES
('Admin Sistema',  'admin@liga.com',  '$2b$12$b2Aoi4WRwyyPEoEiR6qyiOBwefDOKJKMT7RxqKKApJlNkWq3yZBY2', 'activo', 1),
('Carlos Lopez',   'carlos@liga.com', '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2),
('Maria Gomez',    'maria@liga.com',  '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2),
('Luis Martinez',  'luis@liga.com',   '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2),
('Ana Torres',     'ana@liga.com',    '$2b$12$bxTcBoUrqnrRx.Ph5ypvcerwH0QbaIegZ5z0CDJFQjmfjG3XBCDpe', 'activo', 2);

-- Liga de apuesta (precio 500) para probar el motor de premios
INSERT INTO liga (nombre, tipo_liga, modalidad_liga, precio_participacion,
                  id_creador_usuario, id_admin_usuario, estado) VALUES
('Liga Apuesta Demo', 'privada', 'apuesta', 500.00, 1, 1, 'activa'),
('Liga Diversion Demo', 'publica', 'diversion', 0.00, 1, 1, 'activa');

-- Miembros de la liga 1 (los ids de liga_miembro seran 1..4)
INSERT INTO liga_miembro (id_liga, id_usuario, nombre_equipo, rol_liga, estado_membresia) VALUES
(1, 2, 'Equipo Carlos', 'participante', 'activo'),
(1, 3, 'Equipo Maria',  'participante', 'activo'),
(1, 4, 'Equipo Luis',   'participante', 'activo'),
(1, 5, 'Equipo Ana',    'participante', 'activo');

-- Vaticinios (uno por miembro)
INSERT INTO vaticinio (id_liga_miembro, id_partido, goles_local_pred, goles_visitante_pred) VALUES
(1, 1, 2, 1),
(2, 1, 1, 1),
(3, 1, 0, 0),
(4, 1, 3, 2);

-- Puntajes que dan un ranking claro (sin empates):
--   Carlos 9, Maria 6, Luis 3, Ana 1
INSERT INTO puntaje (id_vaticinio, puntos, acerto_resultado, acerto_marcador) VALUES
(1, 9, TRUE,  TRUE),
(2, 6, TRUE,  FALSE),
(3, 3, TRUE,  FALSE),
(4, 1, FALSE, FALSE);

-- Sincroniza las secuencias SERIAL despues de cargar datos iniciales.
-- Evita errores de llave duplicada cuando la app crea nuevos registros.
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
