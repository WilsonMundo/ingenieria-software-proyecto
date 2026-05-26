import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface CierreLiga {
  id_cierre_liga: number;
  id_liga: number;
  total_recaudado: number;
  comision: number;
  fondo_global: number;
  monto_neto: number;
  promedio_puntos?: number;
  fecha_cierre?: string;
}

export interface DistribucionPremio {
  id_distribucion?: number;
  id_cierre_liga: number;
  posicion_final: number;
  porcentaje: number;
  monto: number;
  descripcion: string;
}

export interface PremioGanador {
  id_premio: number;
  id_liga: number;
  id_usuario: number;
  nombre_completo: string;
  tipo_premio: string;
  monto: number;
  descripcion: string;
  fecha_asignacion: string;
}

export interface PremiosLigaResponse {
  cierre: CierreLiga;
  distribucion: DistribucionPremio[];
  premios: PremioGanador[];
}

export interface LigaResumenPremios {
  id_liga: number;
  nombre: string;
  estado: string;
  precio_participacion: number;
  miembros_activos: number;
  id_cierre_liga: number | null;
  total_recaudado: number | null;
  fecha_cierre: string | null;
}

export interface CierreLigaResponse {
  message: string;
  id_liga: number;
  id_cierre_liga: number;
  participantes_activos: number;
  total_recaudado: number;
  comision: number;
  fondo_global: number;
  monto_neto: number;
  premios: Array<{
    id_premio: number;
    id_usuario: number;
    usuario: string;
    tipo_premio: string;
    monto: number;
    puntos: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PremiosService {
  private apiUrl = 'http://127.0.0.1:8000/api/premios';
  private requestTimeoutMs = 10000;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getLigasApuesta(): Observable<LigaResumenPremios[]> {
    return this.http
      .get<LigaResumenPremios[]>(`${this.apiUrl}/ligas`, {
        headers: this.authHeaders()
      })
      .pipe(timeout(this.requestTimeoutMs));
  }

  getPremiosLiga(idLiga: number | string): Observable<PremiosLigaResponse> {
    return this.http
      .get<PremiosLigaResponse>(`${this.apiUrl}/ligas/${idLiga}`, {
        headers: this.authHeaders()
      })
      .pipe(timeout(this.requestTimeoutMs));
  }

  cerrarLiga(idLiga: number | string): Observable<CierreLigaResponse> {
    return this.http
      .post<CierreLigaResponse>(`${this.apiUrl}/ligas/${idLiga}/cerrar`, {}, {
        headers: this.authHeaders()
      })
      .pipe(timeout(this.requestTimeoutMs));
  }

  eliminarPremio(idPremio: number, motivo?: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${idPremio}`, {
        headers: this.authHeaders(),
        body: { motivo }
      })
      .pipe(timeout(this.requestTimeoutMs));
  }
}
