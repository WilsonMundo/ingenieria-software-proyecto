import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { League } from '../interfaces/league.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private apiUrl = environment.apiBaseUrl;
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

  createPrediction(
    idLiga: number,
    data: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/api/vaticinios/${idLiga}`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );

  }

}
