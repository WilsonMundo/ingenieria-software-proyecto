from datetime import datetime

from pydantic import BaseModel


class ClasificacionItem(BaseModel):
    posicion: int
    id_liga_miembro: int
    id_usuario: int
    nombre_usuario: str
    nombre_equipo: str
    puntos: int
    aciertos_exactos: int
    aciertos_resultado: int
    posicion_anterior: int | None = None
    movimiento: int = 0


class ClasificacionResponse(BaseModel):
    id_liga: int
    nombre_liga: str
    total_miembros: int
    fecha_calculo: datetime
    clasificacion: list[ClasificacionItem]


class ClasificacionHistoricoItem(BaseModel):
    id_historico: int
    id_liga: int
    id_liga_miembro: int
    id_partido: int | None = None
    nombre_usuario: str
    nombre_equipo: str
    posicion_anterior: int | None = None
    posicion_actual: int
    puntos_acumulados: int
    fecha_calculo: datetime


class RecalculoClasificacionResponse(BaseModel):
    mensaje: str
    id_liga: int
    registros_actualizados: int
    historicos_creados: int
    fecha_calculo: datetime
