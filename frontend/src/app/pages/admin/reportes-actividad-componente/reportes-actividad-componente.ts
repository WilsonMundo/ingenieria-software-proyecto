import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { finalize, take } from 'rxjs';

import { ActividadItem, AdminService } from '../../../services/admin-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-reportes-actividad-componente',
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
  templateUrl: './reportes-actividad-componente.html',
  styleUrl: './reportes-actividad-componente.css',
})
export class ReportesActividadComponente implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  columnasMostrar: string[] = ['tabla_afectada', 'operacion', 'total_eventos', 'ultimo_evento'];
  dataSource: ActividadItem[] = [];
  cargando = false;
  error = '';
  ultimaActualizacion: Date | null = null;

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

        this.cargarReporte();
      },
      error: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      },
    });
  }

  cargarReporte(): void {
    this.cargando = true;
    this.error = '';

    this.adminService
      .getReportesActividad()
      .pipe(
        take(1),
        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.dataSource = Array.isArray(response)
            ? response
            : Array.isArray(response.items)
              ? response.items
              : [];
          this.ultimaActualizacion = new Date();
        },
        error: (err) => {
          this.dataSource = [];
          this.error = err?.error?.detail ?? 'No se pudo cargar el reporte de actividad.';
          console.error('Error al cargar reportes de actividad:', err);
        },
      });
  }

  imprimirReporte(): void {
    window.print();
  }
}
