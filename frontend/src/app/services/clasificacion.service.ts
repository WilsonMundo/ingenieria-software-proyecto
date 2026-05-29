import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import {
  ClasificacionHistoricoItem,
  ClasificacionResponse,
  RecalculoClasificacionResponse
} from '../models/dto/clasificacion';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionService {
  private apiUrl = `${environment.apiBaseUrl}/api/ligas`;
  private requestTimeoutMs = 10000;

  constructor(private http: HttpClient) {}

  obtenerClasificacion(idLiga: number): Observable<ClasificacionResponse> {
    return this.http
      .get<ClasificacionResponse>(`${this.apiUrl}/${idLiga}/clasificacion`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  obtenerHistorico(idLiga: number): Observable<ClasificacionHistoricoItem[]> {
    return this.http
      .get<ClasificacionHistoricoItem[]>(`${this.apiUrl}/${idLiga}/clasificacion/historico`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  recalcular(idLiga: number, idPartido?: number): Observable<RecalculoClasificacionResponse> {
    const url = idPartido
      ? `${this.apiUrl}/${idLiga}/clasificacion/recalcular?id_partido=${idPartido}`
      : `${this.apiUrl}/${idLiga}/clasificacion/recalcular`;

    return this.http
      .post<RecalculoClasificacionResponse>(url, {})
      .pipe(timeout(this.requestTimeoutMs));
  }
}
