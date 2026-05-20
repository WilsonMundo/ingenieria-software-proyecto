import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResultadoOficial, ResultadoOficialCreate, ResultadoOficialUpdate } from '../models/dto/resultado-oficial.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResultadoOficialService {
  private apiUrl = `${environment.apiUrl}/resultados`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ResultadoOficial[]> { return this.http.get<ResultadoOficial[]>(this.apiUrl); }
  getByPartido(idPartido: number): Observable<ResultadoOficial> { return this.http.get<ResultadoOficial>(`${this.apiUrl}/partido/${idPartido}`); }
  getById(id: number): Observable<ResultadoOficial> { return this.http.get<ResultadoOficial>(`${this.apiUrl}/${id}`); }
  create(data: ResultadoOficialCreate): Observable<ResultadoOficial> { return this.http.post<ResultadoOficial>(this.apiUrl, data); }
  update(id: number, data: ResultadoOficialUpdate): Observable<ResultadoOficial> { return this.http.put<ResultadoOficial>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
