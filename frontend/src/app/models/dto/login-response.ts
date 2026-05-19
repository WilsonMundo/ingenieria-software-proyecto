export interface UsuarioLogin {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  usuario: UsuarioLogin;
}