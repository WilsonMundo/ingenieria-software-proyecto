import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-perfil-componente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './perfil-componente.html',
  styleUrl: './perfil-componente.css'
})
export class PerfilComponente implements OnInit {
  usuario: any = null;
  mensajeError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.authService.obtenerPerfil().subscribe({
      next: (response) => {
        this.usuario = response;
      },
      error: (error) => {
        console.error('Error obteniendo perfil:', error);
        this.mensajeError = 'No se pudo cargar el perfil. Inicia sesión nuevamente.';
        this.authService.limpiarSesion();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error cerrando sesión:', error);
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      }
    });
  }

  irInvitaciones(): void {
    this.router.navigate(['/invitaciones']);
  }
}