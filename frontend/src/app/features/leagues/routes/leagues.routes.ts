import { Routes } from '@angular/router';

import { MyLeaguesComponent } from '../pages/my-leagues/my-leagues.component';

export const LEAGUES_ROUTES: Routes = [
  {
    path: '',
    component: MyLeaguesComponent
  }
];