export type EstadoTorneo = 'programado' | 'en_curso' | 'finalizado';

export interface Torneo {
  id_torneo: number;
  nombre: string;
  anio: number;
  estado: EstadoTorneo;
}

export interface TorneoCreate {
  nombre: string;
  anio: number;
  estado: EstadoTorneo;
}

export interface TorneoUpdate {
  nombre?: string;
  anio?: number;
  estado?: EstadoTorneo;
}
