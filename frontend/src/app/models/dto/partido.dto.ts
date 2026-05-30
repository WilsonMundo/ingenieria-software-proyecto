import { Pais } from './pais.dto';
import { Estadio } from './estadio.dto';
import { Fase } from './fase.dto';
import { Grupo } from './grupo.dto';

export type EstadoPartido = 'programado' | 'en_juego' | 'finalizado' | 'suspendido';

export interface Partido {
  id_partido: number;
  id_torneo: number;
  id_fase: number;
  id_grupo: number | null;
  id_estadio: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  fecha_hora_inicio: string;
  estado_partido: EstadoPartido;
  equipo_local?: Pais;
  equipo_visitante?: Pais;
  estadio?: Estadio;
  fase?: Fase;
  grupo?: Grupo;
}

export interface PartidoCreate {
  id_torneo: number;
  id_fase: number;
  id_grupo: number;
  id_estadio: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  fecha_hora_inicio: string;
  estado_partido?: EstadoPartido;
}

export interface PartidoUpdate {
  id_fase?: number;
  id_grupo?: number | null;
  id_estadio?: number;
  id_equipo_local?: number;
  id_equipo_visitante?: number;
  fecha_hora_inicio?: string;
  estado_partido?: EstadoPartido;
}
