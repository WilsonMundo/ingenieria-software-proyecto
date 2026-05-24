import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { finalize, take } from 'rxjs';

import { AdminService, AuditLogItem } from '../../../services/admin-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-audit-log-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
  ],
  templateUrl: './audit-log-componente.html',
  styleUrl: './audit-log-componente.css',
})
export class AuditLogComponente implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  columnasMostrar: string[] = [
    'fecha_evento',
    'tabla_afectada',
    'operacion',
    'id_registro',
    'usuario_bd',
    'datos',
  ];

  logs: AuditLogItem[] = [];
  cargando = false;
  error = '';
  total = 0;
  ultimaActualizacion: Date | null = null;

  filtroTabla = '';
  filtroOperacion = '';
  limite = 50;

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

        this.cargarAuditoria();
      },
      error: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      },
    });
  }

  cargarAuditoria(): void {
    this.cargando = true;
    this.error = '';

    this.adminService
      .getAuditLogs({
        tabla: this.filtroTabla || undefined,
        operacion: this.filtroOperacion || undefined,
        limite: this.limite,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.logs = response.items ?? [];
          this.total = response.total ?? this.logs.length;
          this.ultimaActualizacion = new Date();
        },
        error: (err) => {
          this.logs = [];
          this.total = 0;
          this.error = err?.error?.detail ?? 'No se pudo cargar la bitacora de auditoria.';
          console.error('Error al cargar audit_log:', err);
        },
      });
  }

  limpiarFiltros(): void {
    this.filtroTabla = '';
    this.filtroOperacion = '';
    this.limite = 50;
    this.cargarAuditoria();
  }

  formatearJson(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '-';
    }

    if (typeof valor === 'string') {
      return valor;
    }

    return JSON.stringify(valor, null, 2);
  }
}
