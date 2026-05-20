import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estadio, EstadioCreate, EstadioUpdate } from '../models/dto/estadio.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadioService {
  private apiUrl = `${environment.apiUrl}/estadios`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Estadio[]> { return this.http.get<Estadio[]>(this.apiUrl); }
  getBySede(idSede: number): Observable<Estadio[]> { return this.http.get<Estadio[]>(`${this.apiUrl}?sede=${idSede}`); }
  getById(id: number): Observable<Estadio> { return this.http.get<Estadio>(`${this.apiUrl}/${id}`); }
  create(data: EstadioCreate): Observable<Estadio> { return this.http.post<Estadio>(this.apiUrl, data); }
  update(id: number, data: EstadioUpdate): Observable<Estadio> { return this.http.put<Estadio>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
