import { Sede } from './sede.dto';

export interface Estadio {
  id_estadio: number;
  id_sede: number;
  nombre: string;
  capacidad: number | null;
  sede?: Sede;
}

export interface EstadioCreate {
  id_sede: number;
  nombre: string;
  capacidad?: number | null;
}

export interface EstadioUpdate {
  id_sede?: number;
  nombre?: string;
  capacidad?: number | null;
}
