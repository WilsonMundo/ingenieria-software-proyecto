import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { finalize, take } from 'rxjs';

import { PremiosLigaResponse, PremiosService } from '../../../services/premios-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-premios-liga-componente',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatToolbarModule,
  ],
  templateUrl: './premios-liga-componente.html',
  styleUrl: './premios-liga-componente.css',
})
export class PremiosLigaComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly premiosService = inject(PremiosService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  idLiga = '';
  nombreLiga = 'Liga';
  datosCierre: PremiosLigaResponse | null = null;
  cargando = false;
  error = '';

  columnasDistribucion: string[] = ['posicion', 'porcentaje', 'monto', 'descripcion'];
  columnasGanadores: string[] = ['nombre', 'tipo', 'monto', 'fecha'];

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.idLiga = this.route.snapshot.paramMap.get('id') ?? '';
    this.nombreLiga = this.idLiga ? `Liga #${this.idLiga}` : 'Liga';

    if (this.idLiga) {
      this.obtenerDatos();
    } else {
      this.error = 'No se recibio el id de la liga.';
    }
  }

  obtenerDatos(): void {
    this.cargando = true;
    this.error = '';

    this.premiosService
      .getPremiosLiga(this.idLiga)
      .pipe(
        take(1),
        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (res) => {
          this.datosCierre = res;
        },
        error: (err) => {
          this.datosCierre = null;
          this.error = err?.error?.detail ?? 'La liga aun no tiene cierre registrado.';
          console.error('Error al consultar premios:', err);
        },
      });
  }

  ejecutarCierre(): void {
    this.cargando = true;
    this.error = '';

    this.premiosService
      .cerrarLiga(this.idLiga)
      .pipe(
        take(1),
        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: () => this.obtenerDatos(),
        error: (err) => {
          this.error = err?.error?.detail ?? 'No se pudo cerrar la liga y calcular los premios.';
          console.error('Error al cerrar la liga:', err);
        },
      });
  }

  regresar(): void {
    this.location.back();
  }
}
