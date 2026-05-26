import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, take } from 'rxjs';

import { LigaResumenPremios, PremiosService } from '../../../services/premios-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-ligas-premios-componente',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './ligas-premios-componente.html',
  styleUrl: './ligas-premios-componente.css',
})
export class LigasPremiosComponente implements OnInit {
  private readonly premiosService = inject(PremiosService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ligas: LigaResumenPremios[] = [];
  cargando = false;
  error = '';
  ultimaActualizacion: Date | null = null;

  get ligasAbiertas(): LigaResumenPremios[] {
    return this.ligas.filter(l => !l.id_cierre_liga);
  }

  get ligasCerradas(): LigaResumenPremios[] {
    return this.ligas.filter(l => !!l.id_cierre_liga);
  }

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.obtenerPerfil().subscribe({
      next: (perfil) => {
        if (perfil.rol !== 'administrador') {
          this.router.navigate(['/dashboard']);
          return;
        }
        this.cargarLigas();
      },
      error: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      },
    });
  }

  cargarLigas(): void {
    this.cargando = true;
    this.error = '';

    this.premiosService
      .getLigasApuesta()
      .pipe(
        take(1),
        finalize(() => { this.cargando = false; }),
      )
      .subscribe({
        next: (res) => {
          this.ligas = res;
          this.ultimaActualizacion = new Date();
        },
        error: (err) => {
          this.error = err?.error?.detail ?? 'No se pudieron cargar las ligas.';
        },
      });
  }

  irADetalle(liga: LigaResumenPremios): void {
    this.router.navigate(['/premios/liga', liga.id_liga]);
  }
}
