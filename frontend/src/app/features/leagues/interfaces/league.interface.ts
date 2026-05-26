export interface League {
  id_liga: number;
  nombre: string;
  tipo_liga: string;
  precio_participacion: string;
  estado: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}