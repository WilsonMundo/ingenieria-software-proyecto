import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  EnviarInvitacionRequest,
  InvitacionResponse,
  ValidarInvitacionResponse,
  AceptarInvitacionRequest
} from '../models/dto/invitacion'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvitacionService {
  private apiUrl = `${environment.apiBaseUrl}/api/invitaciones`;

  constructor(private http: HttpClient) {}

  enviarInvitacion(data: EnviarInvitacionRequest): Observable<InvitacionResponse> {
    return this.http.post<InvitacionResponse>(`${this.apiUrl}/enviar`, data);
  }

  validarInvitacion(token: string): Observable<ValidarInvitacionResponse> {
    return this.http.get<ValidarInvitacionResponse>(`${this.apiUrl}/validar/${token}`);
  }

  aceptarInvitacion(data: AceptarInvitacionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/aceptar`, data);
  }
}
