export interface ClasificacionItem {
  posicion: number;
  id_liga_miembro: number;
  id_usuario: number;
  nombre_usuario: string;
  nombre_equipo: string;
  puntos: number;
  aciertos_exactos: number;
  aciertos_resultado: number;
  posicion_anterior: number | null;
  movimiento: number;
}

export interface ClasificacionResponse {
  id_liga: number;
  nombre_liga: string;
  total_miembros: number;
  fecha_calculo: string;
  clasificacion: ClasificacionItem[];
}

export interface ClasificacionHistoricoItem {
  id_historico: number;
  id_liga: number;
  id_liga_miembro: number;
  id_partido: number | null;
  nombre_usuario: string;
  nombre_equipo: string;
  posicion_anterior: number | null;
  posicion_actual: number;
  puntos_acumulados: number;
  fecha_calculo: string;
}

export interface RecalculoClasificacionResponse {
  mensaje: string;
  id_liga: number;
  registros_actualizados: number;
  historicos_creados: number;
  fecha_calculo: string;
}
