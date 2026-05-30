-- ============================================================
-- INSERTS DEMO - Equipos, grupos y sedes
-- Proyecto: Liga Mundial / Mundial 2026
--
-- Nota:
-- - En el backend, "equipo" se representa con la tabla "pais".
-- - Este script es independiente de init.sql.
-- - Ejecutar despues de que la API haya creado las tablas mundial:
--     torneo, grupo, pais, sede
--
-- Ejemplo con Docker desde PowerShell:
--   Get-Content .\insert_equipos_grupos_sedes.sql -Raw | docker exec -i gestion-corporativa psql -U postgres -d liga_mundial
-- ============================================================

BEGIN;

-- Torneo base requerido por grupo.id_torneo.
WITH torneo_insertado AS (
    INSERT INTO torneo (nombre, anio, estado)
    SELECT 'Mundial 2026', 2026, 'activo'
    WHERE NOT EXISTS (
        SELECT 1
        FROM torneo
        WHERE nombre = 'Mundial 2026'
          AND anio = 2026
    )
    RETURNING id_torneo
),
torneo_base AS (
    SELECT id_torneo FROM torneo_insertado
    UNION ALL
    SELECT id_torneo
    FROM torneo
    WHERE nombre = 'Mundial 2026'
      AND anio = 2026
    ORDER BY id_torneo
    LIMIT 1
),
grupos_demo(nombre) AS (
    VALUES
        ('Grupo A'),
        ('Grupo B'),
        ('Grupo C'),
        ('Grupo D'),
        ('Grupo E'),
        ('Grupo F'),
        ('Grupo G'),
        ('Grupo H'),
        ('Grupo I'),
        ('Grupo J'),
        ('Grupo K'),
        ('Grupo L')
)
INSERT INTO grupo (id_torneo, nombre)
SELECT tb.id_torneo, gd.nombre
FROM torneo_base tb
CROSS JOIN grupos_demo gd
WHERE NOT EXISTS (
    SELECT 1
    FROM grupo g
    WHERE g.id_torneo = tb.id_torneo
      AND g.nombre = gd.nombre
);

-- Sedes demo del Mundial 2026.
INSERT INTO sede (nombre, ciudad, pais_sede)
SELECT s.nombre, s.ciudad, s.pais_sede
FROM (
    VALUES
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
        ('Sede Vancouver', 'Vancouver', 'Canada')
) AS s(nombre, ciudad, pais_sede)
WHERE NOT EXISTS (
    SELECT 1
    FROM sede existente
    WHERE existente.nombre = s.nombre
      AND existente.ciudad = s.ciudad
      AND existente.pais_sede = s.pais_sede
);

-- Equipos demo. En la BD se guardan como paises.
WITH torneo_base AS (
    SELECT id_torneo
    FROM torneo
    WHERE nombre = 'Mundial 2026'
      AND anio = 2026
    ORDER BY id_torneo
    LIMIT 1
),
equipos_demo(grupo_nombre, nombre, codigo_fifa, confederacion) AS (
    VALUES
        ('Grupo A', 'Mexico', 'MEX', 'CONCACAF'),
        ('Grupo A', 'Canada', 'CAN', 'CONCACAF'),
        ('Grupo A', 'Estados Unidos', 'USA', 'CONCACAF'),
        ('Grupo A', 'Brasil', 'BRA', 'CONMEBOL'),

        ('Grupo B', 'Argentina', 'ARG', 'CONMEBOL'),
        ('Grupo B', 'Uruguay', 'URU', 'CONMEBOL'),
        ('Grupo B', 'Colombia', 'COL', 'CONMEBOL'),
        ('Grupo B', 'Ecuador', 'ECU', 'CONMEBOL'),

        ('Grupo C', 'Paraguay', 'PAR', 'CONMEBOL'),
        ('Grupo C', 'Chile', 'CHI', 'CONMEBOL'),
        ('Grupo C', 'Peru', 'PER', 'CONMEBOL'),
        ('Grupo C', 'Bolivia', 'BOL', 'CONMEBOL'),

        ('Grupo D', 'Inglaterra', 'ENG', 'UEFA'),
        ('Grupo D', 'Francia', 'FRA', 'UEFA'),
        ('Grupo D', 'Alemania', 'GER', 'UEFA'),
        ('Grupo D', 'Espana', 'ESP', 'UEFA'),

        ('Grupo E', 'Portugal', 'POR', 'UEFA'),
        ('Grupo E', 'Paises Bajos', 'NED', 'UEFA'),
        ('Grupo E', 'Belgica', 'BEL', 'UEFA'),
        ('Grupo E', 'Croacia', 'CRO', 'UEFA'),

        ('Grupo F', 'Italia', 'ITA', 'UEFA'),
        ('Grupo F', 'Suiza', 'SUI', 'UEFA'),
        ('Grupo F', 'Dinamarca', 'DEN', 'UEFA'),
        ('Grupo F', 'Serbia', 'SRB', 'UEFA'),

        ('Grupo G', 'Marruecos', 'MAR', 'CAF'),
        ('Grupo G', 'Senegal', 'SEN', 'CAF'),
        ('Grupo G', 'Nigeria', 'NGA', 'CAF'),
        ('Grupo G', 'Egipto', 'EGY', 'CAF'),

        ('Grupo H', 'Tunez', 'TUN', 'CAF'),
        ('Grupo H', 'Argelia', 'ALG', 'CAF'),
        ('Grupo H', 'Ghana', 'GHA', 'CAF'),
        ('Grupo H', 'Camerun', 'CMR', 'CAF'),

        ('Grupo I', 'Sudafrica', 'RSA', 'CAF'),
        ('Grupo I', 'Japon', 'JPN', 'AFC'),
        ('Grupo I', 'Corea del Sur', 'KOR', 'AFC'),
        ('Grupo I', 'Iran', 'IRN', 'AFC'),

        ('Grupo J', 'Arabia Saudita', 'KSA', 'AFC'),
        ('Grupo J', 'Australia', 'AUS', 'AFC'),
        ('Grupo J', 'Qatar', 'QAT', 'AFC'),
        ('Grupo J', 'Emiratos Arabes Unidos', 'UAE', 'AFC'),

        ('Grupo K', 'China', 'CHN', 'AFC'),
        ('Grupo K', 'Uzbekistan', 'UZB', 'AFC'),
        ('Grupo K', 'Nueva Zelanda', 'NZL', 'OFC'),
        ('Grupo K', 'Costa Rica', 'CRC', 'CONCACAF'),

        ('Grupo L', 'Panama', 'PAN', 'CONCACAF'),
        ('Grupo L', 'Jamaica', 'JAM', 'CONCACAF'),
        ('Grupo L', 'Honduras', 'HON', 'CONCACAF'),
        ('Grupo L', 'Guatemala', 'GUA', 'CONCACAF')
),
grupos_base AS (
    SELECT g.id_grupo, g.nombre
    FROM grupo g
    JOIN torneo_base tb ON tb.id_torneo = g.id_torneo
)
INSERT INTO pais (nombre, codigo_fifa, confederacion, id_grupo)
SELECT ed.nombre, ed.codigo_fifa, ed.confederacion, gb.id_grupo
FROM equipos_demo ed
JOIN grupos_base gb ON gb.nombre = ed.grupo_nombre
ON CONFLICT (codigo_fifa) DO UPDATE
SET nombre = EXCLUDED.nombre,
    confederacion = EXCLUDED.confederacion,
    id_grupo = EXCLUDED.id_grupo;

-- Ajusta secuencias despues de insertar datos manualmente.
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
          AND tab.relname IN ('torneo', 'grupo', 'pais', 'sede')
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

COMMIT;
