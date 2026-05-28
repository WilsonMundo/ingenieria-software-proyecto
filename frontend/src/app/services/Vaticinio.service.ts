import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VaticinioService {
  private apiUrl = 'http://127.0.0.1:8000/api/vaticinios';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  listarPredicciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/predicciones`, {
      headers: this.getAuthHeaders(),
      params: {
        _: Date.now().toString()
      }
    });
  }

  guardarVaticinio(prediccion: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${prediccion.id_liga}`, prediccion, {
      headers: this.getAuthHeaders()
    });
  }

  calcularPuntos(partidoId: number, golesLocal: number, golesVisitante: number): Observable<any> {
    return this.http.post(
      `http://127.0.0.1:8000/vaticinios/calcular-puntos/${partidoId}?goles_local_real=${golesLocal}&goles_visitante_real=${golesVisitante}`,
      {}
    );
  }
}
