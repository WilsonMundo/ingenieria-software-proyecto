import { Torneo } from './torneo.dto';

export interface Grupo {
  id_grupo: number;
  id_torneo: number;
  nombre: string;
  torneo?: Torneo;
}

export interface GrupoCreate {
  id_torneo: number;
  nombre: string;
}

export interface GrupoUpdate {
  id_torneo?: number;
  nombre?: string;
}
