import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grupo, GrupoCreate, GrupoUpdate } from '../models/dto/grupo.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private apiUrl = `${environment.apiUrl}/grupos`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Grupo[]> { return this.http.get<Grupo[]>(this.apiUrl); }
  getByTorneo(idTorneo: number): Observable<Grupo[]> { return this.http.get<Grupo[]>(`${this.apiUrl}?torneo=${idTorneo}`); }
  getById(id: number): Observable<Grupo> { return this.http.get<Grupo>(`${this.apiUrl}/${id}`); }
  create(data: GrupoCreate): Observable<Grupo> { return this.http.post<Grupo>(this.apiUrl, data); }
  update(id: number, data: GrupoUpdate): Observable<Grupo> { return this.http.put<Grupo>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
