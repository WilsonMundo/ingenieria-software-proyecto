import { Partido } from './partido.dto';

export interface ResultadoOficial {
  id_resultado: number;
  id_partido: number;
  goles_local: number;
  goles_visitante: number;
  fecha_registro: string;
  bloqueado: boolean;
  partido?: Partido;
}

export interface ResultadoOficialCreate {
  id_partido: number;
  goles_local: number;
  goles_visitante: number;
}

export interface ResultadoOficialUpdate {
  goles_local?: number;
  goles_visitante?: number;
  bloqueado?: boolean;
}
