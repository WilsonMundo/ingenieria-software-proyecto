import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainLayoutComponente } from './containers/main-layout/main-layout-componente';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponente
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShellRoutingModule {}
