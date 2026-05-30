export interface Sede {
  id_sede: number;
  nombre: string;
  ciudad: string;
  pais_sede: string;
}

export interface SedeCreate {
  nombre: string;
  ciudad: string;
  pais_sede: string;
}

export interface SedeUpdate {
  nombre?: string;
  ciudad?: string;
  pais_sede?: string;
}
