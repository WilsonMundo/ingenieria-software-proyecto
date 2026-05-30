export interface LoginResponse {
  access_token: string;
  refresh_token:string;
  token_type: string;
  usuario: {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    id_rol: number;
    rol: string;
  };
}
