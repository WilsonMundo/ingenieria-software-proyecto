import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { League } from '../interfaces/league.interface';

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private apiUrl = 'http://127.0.0.1:8000';
  constructor(
    private http: HttpClient
  ) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getLeagues(): Observable<League[]> {
    return this.http.get<League[]>(
      `${this.apiUrl}/api/ligas`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getLeagueById(id: number): Observable<League> {
    return this.http.get<League>(
      `${this.apiUrl}/api/ligas/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  createLeague(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/ligas`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getMatches(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/partidos`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  createPrediction(idLiga: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/vaticinios/${idLiga}`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getPredictions(idLiga: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/vaticinios/${idLiga}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getPendingRequests(idLiga: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/memberships/${idLiga}/requests`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  approveRequest(idLigaMiembro: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/memberships/requests/${idLigaMiembro}/approve`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  rejectRequest(idLigaMiembro: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/api/memberships/requests/${idLigaMiembro}/reject`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  createJoinRequest(idLiga: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/solicitudes/${idLiga}`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getJoinRequests(idLiga: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/solicitudes/${idLiga}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  resolveJoinRequest(idSolicitud: number, estado: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/solicitudes/${idSolicitud}`,
      {
        estado
      },
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}