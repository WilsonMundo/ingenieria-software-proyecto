import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pais, PaisCreate, PaisUpdate } from '../models/dto/pais.dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaisService {
  private apiUrl = `${environment.apiUrl}/paises`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Pais[]> { return this.http.get<Pais[]>(this.apiUrl); }
  getByGrupo(idGrupo: number): Observable<Pais[]> { return this.http.get<Pais[]>(`${this.apiUrl}?grupo=${idGrupo}`); }
  getById(id: number): Observable<Pais> { return this.http.get<Pais>(`${this.apiUrl}/${id}`); }
  create(data: PaisCreate): Observable<Pais> { return this.http.post<Pais>(this.apiUrl, data); }
  update(id: number, data: PaisUpdate): Observable<Pais> { return this.http.put<Pais>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
