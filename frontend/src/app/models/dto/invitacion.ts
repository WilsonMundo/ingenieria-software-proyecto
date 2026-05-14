export interface EnviarInvitacionRequest {
  id_liga: number;
  email_destino: string;
}

export interface InvitacionResponse {
  mensaje: string;
  email_destino: string;
  usuario_registrado: boolean;
  token: string;
  enlace: string;
}

export interface ValidarInvitacionResponse {
  id_invitacion: number;
  id_liga: number;
  email_destino: string;
  estado: string;
  usuario_registrado: boolean;
}

export interface AceptarInvitacionRequest {
  token: string;
  id_usuario: number;
  nombre_equipo?: string;
}