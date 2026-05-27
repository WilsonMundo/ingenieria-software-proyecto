CREATE TABLE IF NOT EXISTS clasificacion_historico (
    id_historico SERIAL PRIMARY KEY,
    id_liga INT NOT NULL REFERENCES liga(id_liga) ON DELETE CASCADE,
    id_liga_miembro INT NOT NULL REFERENCES liga_miembro(id_liga_miembro) ON DELETE CASCADE,
    id_partido INT,
    posicion_anterior INT,
    posicion_actual INT NOT NULL,
    puntos_acumulados INT NOT NULL DEFAULT 0,
    fecha_calculo TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clasificacion_historico_liga_fecha
ON clasificacion_historico(id_liga, fecha_calculo DESC);

CREATE INDEX IF NOT EXISTS idx_clasificacion_historico_miembro
ON clasificacion_historico(id_liga_miembro);
