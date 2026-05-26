import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sede, SedeCreate, SedeUpdate } from '../models/dto/sede.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private apiUrl = `${environment.apiUrl}/sedes`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Sede[]> { return this.http.get<Sede[]>(this.apiUrl); }
  getById(id: number): Observable<Sede> { return this.http.get<Sede>(`${this.apiUrl}/${id}`); }
  create(data: SedeCreate): Observable<Sede> { return this.http.post<Sede>(this.apiUrl, data); }
  update(id: number, data: SedeUpdate): Observable<Sede> { return this.http.put<Sede>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
