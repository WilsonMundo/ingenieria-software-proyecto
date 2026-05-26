import { Grupo } from './grupo.dto';

export interface Pais {
  id_pais: number;
  nombre: string;
  codigo_fifa: string;
  confederacion: string | null;
  id_grupo: number | null;
  grupo?: Grupo;
}

export interface PaisCreate {
  nombre: string;
  codigo_fifa: string;
  confederacion?: string | null;
  id_grupo?: number | null;
}

export interface PaisUpdate {
  nombre?: string;
  codigo_fifa?: string;
  confederacion?: string | null;
  id_grupo?: number | null;
}
