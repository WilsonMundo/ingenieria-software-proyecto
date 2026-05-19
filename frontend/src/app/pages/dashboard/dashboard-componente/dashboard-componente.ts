import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-dashboard-componente',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard-componente.html',
  styleUrl: './dashboard-componente.css'
})
export class DashboardComponente implements OnInit {
  usuario: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = this.authService.obtenerUsuario();
  }

  irDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  irPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  irInvitaciones(): void {
    this.router.navigate(['/invitaciones']);
  }

  accionPendiente(nombreModulo: string): void {
    alert(`${nombreModulo} aún no está disponible. Este módulo será integrado posteriormente.`);
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      }
    });
  }
}