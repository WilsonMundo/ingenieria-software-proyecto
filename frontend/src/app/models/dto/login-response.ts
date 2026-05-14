export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    rol: string;
  };
}
