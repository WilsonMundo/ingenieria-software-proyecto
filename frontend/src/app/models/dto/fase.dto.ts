export interface Fase {
  id_fase: number;
  id_torneo: number;
  nombre: string;
  orden_fase: number;
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
