import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { finalize, retry, take, timer } from 'rxjs';

import { AdminService, DashboardGlobal } from '../../../services/admin-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-dashboard-global-componente',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
  ],
  templateUrl: './dashboard-global-componente.html',
  styleUrl: './dashboard-global-componente.css',
})
export class DashboardGlobalComponente implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  dashboard: DashboardGlobal | null = null;
  cargando = false;
  error = '';
  ultimaActualizacion: Date | null = null;
  private requestActiva = false;
  private autoRefreshId: ReturnType<typeof setInterval> | null = null;

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

        this.cargarDashboard();
        this.autoRefreshId = setInterval(() => this.cargarDashboard(true), 30000);
      },
      error: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.autoRefreshId) {
      clearInterval(this.autoRefreshId);
      this.autoRefreshId = null;
    }
  }

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cargarDashboard(silencioso = false): void {
    if (this.requestActiva) {
      return;
    }

    if (!silencioso) {
      this.cargando = true;
      this.error = '';
    }
    this.requestActiva = true;

    this.adminService
      .getDashboardGlobal()
      .pipe(
        take(1),
        retry({ count: 1, delay: () => timer(1000) }),
        finalize(() => {
          this.requestActiva = false;
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.dashboard = response;
          this.ultimaActualizacion = new Date();
        },
        error: (err) => {
          this.error = err?.error?.detail ?? 'Hubo un problema al obtener los datos del dashboard.';
          console.error('Error al cargar dashboard:', err);
        },
      });
  }
}
