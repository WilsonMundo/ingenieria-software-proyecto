import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginResponse } from '../models/dto/login-response';

export interface RegistroRequest {
  nombre_completo: string;
  email: string;
  password: string;
}

export interface OlvidoContraseniaRequest {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  registro(data: RegistroRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  registrar(nombre_completo: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, {
      nombre_completo,
      email,
      password
    });
  }

  olvidoContrasenia(data: OlvidoContraseniaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/olvido-contrasenia`, data);
  }

  obtenerPerfil(): Observable<any> {
    const token = this.obtenerToken();

    return this.http.get(`${this.apiUrl}/perfil`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  logout(): Observable<any> {
    const refreshToken = this.obtenerRefreshToken();

    return this.http.post(`${this.apiUrl}/logout`, {
      refresh_token: refreshToken
    });
  }

  guardarSesion(response: LoginResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('usuario', JSON.stringify(response.usuario));
  }

  guardarToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('access_token');
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  obtenerUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerUsuarios(): Observable<any[]> {
    const token = this.obtenerToken();

    return this.http.get<any[]>('http://127.0.0.1:8000/api/usuarios', {
        headers: {
          Authorization: `Bearer ${token}`
        }
  });
  }

  darBajaUsuario(idUsuario: number): Observable<any> {
    const token = this.obtenerToken();

    return this.http.patch(`http://127.0.0.1:8000/api/usuarios/${idUsuario}/dar-baja`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  limpiarSesion(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('recordar_sesion');

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('usuario');
  }

  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
  const token = this.obtenerToken();

    return this.http.put(`${this.apiUrl}/cambiar-password`, {
      password_actual: passwordActual,
      nueva_password: nuevaPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  resetPassword(token: string, nuevaPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token: token,
      nueva_password: nuevaPassword
    });
  }
}