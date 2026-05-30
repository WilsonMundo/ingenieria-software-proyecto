import { Routes } from '@angular/router';

import { MyLeaguesComponent } from '../pages/my-leagues/my-leagues.component';
import { CreateLeagueComponent } from '../pages/create-league/create-league.component';

export const LEAGUES_ROUTES: Routes = [
  {
    path: '',
    component: MyLeaguesComponent
  },
  {
    path: 'crear',
    component: CreateLeagueComponent
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/league-detail/league-detail.component')
        .then(m => m.LeagueDetailComponent)
  }
];