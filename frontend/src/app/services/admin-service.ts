import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface DashboardGlobal {
  total_usuarios: number;
  total_ligas: number;
  ligas_apuesta: number;
  ligas_diversion: number;
  premios_activos: number;
  total_recaudado_global: number;
  comision_global: number;
  fondo_global: number;
}

export interface AuditLogItem {
  id_audit_log: number;
  tabla_afectada: string;
  operacion: string;
  id_registro: number | null;
  datos_anteriores: unknown;
  datos_nuevos: unknown;
  usuario_bd: string;
  fecha_evento: string;
}

export interface AuditLogResponse {
  total: number;
  items: AuditLogItem[];
}

export interface ActividadItem {
  tabla_afectada: string;
  operacion: string;
  total_eventos: number;
  ultimo_evento: string;
}

export interface ActividadResponse {
  items: ActividadItem[];
}

export interface AuditLogFiltros {
  tabla?: string;
  operacion?: string;
  limite?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://127.0.0.1:8000/api/admin';
  private requestTimeoutMs = 10000;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getDashboardGlobal(): Observable<DashboardGlobal> {
    return this.http
      .get<DashboardGlobal>(`${this.apiUrl}/dashboard-global`, {
        headers: this.authHeaders()
      })
      .pipe(timeout(this.requestTimeoutMs));
  }

  getAuditLogs(filtros: AuditLogFiltros = {}): Observable<AuditLogResponse> {
    let params = new HttpParams();

    if (filtros.tabla) {
      params = params.set('tabla', filtros.tabla);
    }

    if (filtros.operacion) {
      params = params.set('operacion', filtros.operacion);
    }

    if (filtros.limite) {
      params = params.set('limite', filtros.limite);
    }

    return this.http
      .get<AuditLogResponse>(`${this.apiUrl}/audit-log`, {
        headers: this.authHeaders(),
        params
      })
      .pipe(timeout(this.requestTimeoutMs));
  }

  getReportesActividad(): Observable<ActividadResponse> {
    return this.http
      .get<ActividadResponse>(`${this.apiUrl}/reportes/actividad`, {
        headers: this.authHeaders()
      })
      .pipe(timeout(this.requestTimeoutMs));
  }
}
