from sqlalchemy import text
from sqlalchemy.orm import Session

def obtener_partidos_mundial(
    db: Session
):
    query = text("""
        SELECT p.id_partido, loc.nombre || ' vs ' || vis.nombre AS encuentro,
            INITCAP(to_char(p.fecha_hora_inicio, 'DD TMMonth YYYY')) || ' - ' || to_char(p.fecha_hora_inicio, 'HH24:MI') AS fecha_y_hora
        FROM public.partido p
        INNER JOIN public.pais loc ON p.id_equipo_local = loc.id_pais
        INNER JOIN public.pais vis ON p.id_equipo_visitante = vis.id_pais
        WHERE p.id_torneo = (SELECT id_torneo FROM public.torneo WHERE anio = 2026 LIMIT 1)
    """)
    result = db.execute(query)
    return result.mappings().all()