import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainLayoutComponente } from './containers/main-layout/main-layout-componente';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponente,
    children: [
      {
        path: 'ligas',
        loadChildren: () =>
          import('../features/leagues/routes/leagues.routes').then(
            (m) => m.LEAGUES_ROUTES
          )
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShellRoutingModule {}