import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SedesListaComponente } from '../sedes/sedes-lista-componente/sedes-lista-componente';
import { EstadiosListaComponente } from '../estadios/estadios-lista-componente/estadios-lista-componente';
import { PaisesListaComponente } from '../paises/paises-lista-componente/paises-lista-componente';
import { GruposListaComponente } from '../grupos/grupos-lista-componente/grupos-lista-componente';
import { FasesListaComponente } from '../fases/fases-lista-componente/fases-lista-componente';
import { PartidosListaComponente } from '../partidos/partidos-lista-componente/partidos-lista-componente';
import { BracketComponente } from '../partidos/bracket-componente/bracket-componente';
import { ResultadosListaComponente } from '../resultados/resultados-lista-componente/resultados-lista-componente';

@Component({
  selector: 'app-admin-mundial',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
    SedesListaComponente,
    EstadiosListaComponente,
    PaisesListaComponente,
    GruposListaComponente,
    FasesListaComponente,
    PartidosListaComponente,
    BracketComponente,
    ResultadosListaComponente,
  ],
  templateUrl: './admin-mundial-componente.html',
  styleUrl: './admin-mundial-componente.css',
})
export class AdminMundialComponente {}
