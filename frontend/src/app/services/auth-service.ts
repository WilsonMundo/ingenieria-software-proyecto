import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Login } from '../models/dto/login';
import { LoginResponse } from '../models/dto/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(private http: HttpClient) {}

  login(data: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }

   registro(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro`, data);
  }

  olvidoContrasenia(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/olvido-contrasenia`, data);
  }

  guardarToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('access_token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('access_token');
  }
}