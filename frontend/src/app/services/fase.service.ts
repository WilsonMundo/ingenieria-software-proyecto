import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fase, FaseCreate, FaseUpdate } from '../models/dto/fase.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FaseService {
  private apiUrl = `${environment.apiUrl}/fases`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Fase[]> { return this.http.get<Fase[]>(this.apiUrl); }
  getByTorneo(idTorneo: number): Observable<Fase[]> { return this.http.get<Fase[]>(`${this.apiUrl}?torneo=${idTorneo}`); }
  getById(id: number): Observable<Fase> { return this.http.get<Fase>(`${this.apiUrl}/${id}`); }
  create(data: FaseCreate): Observable<Fase> { return this.http.post<Fase>(this.apiUrl, data); }
  update(id: number, data: FaseUpdate): Observable<Fase> { return this.http.put<Fase>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
