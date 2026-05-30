import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ShellRoutingModule } from './shell-routing.module';
import { MainLayoutComponente } from './containers/main-layout/main-layout-componente';

@NgModule({
  declarations: [MainLayoutComponente],
  imports: [CommonModule, MatIconModule, ShellRoutingModule]
})
export class ShellModule {}
