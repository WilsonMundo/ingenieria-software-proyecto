import { Torneo } from './torneo.dto';

export interface Fase {
  id_fase: number;
  id_torneo: number;
  nombre: string;
  orden_fase: number;
  torneo?: Torneo;
}

export interface FaseCreate {
  id_torneo: number;
  nombre: string;
  orden_fase: number;
}

export interface FaseUpdate {
  id_torneo?: number;
  nombre?: string;
  orden_fase?: number;
}
