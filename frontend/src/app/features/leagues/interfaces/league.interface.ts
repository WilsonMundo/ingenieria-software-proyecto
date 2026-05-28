export interface League {
  id_liga: number;
  nombre: string;
  descripcion?: string;
  total_participantes?: number;
  tipo_liga: string;
  precio_participacion: number;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_creacion?: string;
  rol_liga?: string;
  estado_membresia?: string;
}