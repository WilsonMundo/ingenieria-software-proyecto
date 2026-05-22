import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { League } from '../interfaces/league.interface';

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {

  private leagues: League[] = [
    {
      id: 1,
      name: 'Liga Nacional',
      sport: 'Fútbol',
      teamsCount: 10,
      status: 'Activa',
      startDate: '2026-01-10',
      endDate: '2026-06-10'
    },
    {
      id: 2,
      name: 'Copa Universitaria',
      sport: 'Baloncesto',
      teamsCount: 8,
      status: 'Pendiente',
      startDate: '2026-02-15',
      endDate: '2026-05-20'
    }
  ];

  getLeagues(): Observable<League[]> {
    return of(this.leagues);
  }
}