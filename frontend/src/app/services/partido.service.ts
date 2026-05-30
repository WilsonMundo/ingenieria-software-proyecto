import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partido, PartidoCreate, PartidoUpdate } from '../models/dto/partido.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PartidoService {
  private apiUrl = `${environment.apiUrl}/partidos`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Partido[]> { return this.http.get<Partido[]>(this.apiUrl); }
  getByTorneo(idTorneo: number): Observable<Partido[]> { return this.http.get<Partido[]>(`${this.apiUrl}?torneo=${idTorneo}`); }
  getByFase(idFase: number): Observable<Partido[]> { return this.http.get<Partido[]>(`${this.apiUrl}?fase=${idFase}`); }
  getById(id: number): Observable<Partido> { return this.http.get<Partido>(`${this.apiUrl}/${id}`); }
  create(data: PartidoCreate): Observable<Partido> { return this.http.post<Partido>(this.apiUrl, data); }
  update(id: number, data: PartidoUpdate): Observable<Partido> { return this.http.put<Partido>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
