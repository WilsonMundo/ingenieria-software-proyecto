import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VaticinioService {
  // URL unificada que apunta al backend integrado del grupo (Windows)
  private apiUrl = 'http://localhost:8000/vaticinios'; 

  constructor(private http: HttpClient) {}

  guardarVaticinio(prediccion: any): Observable<any> {
    // Agrega la barra diagonal al final del backend cuando lo exige en el decorador (@router.post("/"))
    return this.http.post(`${this.apiUrl}/`, prediccion);
  }

  // Lista la función para calcular los puntos
  calcularPuntos(partidoId: number, golesLocal: number, golesVisitante: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/calcular-puntos/${partidoId}?goles_local_real=${golesLocal}&goles_visitante_real=${golesVisitante}`, {});
  }
}