import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Torneo, TorneoCreate, TorneoUpdate } from '../models/dto/torneo.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TorneoService {
  private apiUrl = `${environment.apiUrl}/torneos`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Torneo[]> { return this.http.get<Torneo[]>(this.apiUrl); }
  getById(id: number): Observable<Torneo> { return this.http.get<Torneo>(`${this.apiUrl}/${id}`); }
  create(data: TorneoCreate): Observable<Torneo> { return this.http.post<Torneo>(this.apiUrl, data); }
  update(id: number, data: TorneoUpdate): Observable<Torneo> { return this.http.put<Torneo>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
