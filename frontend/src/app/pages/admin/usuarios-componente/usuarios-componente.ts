import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-usuarios-componente',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './usuarios-componente.html',
  styleUrl: './usuarios-componente.css'
})
export class UsuariosComponente implements OnInit {
  usuarios: any[] = [];
  usuarioActual: any = null;

  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.validarAdministrador();
  }

  validarAdministrador(): void {
    this.authService.obtenerPerfil().subscribe({
      next: (response) => {
        this.usuarioActual = response;

        console.log('Usuario actual validado desde backend:', this.usuarioActual);

        if (this.usuarioActual.rol !== 'administrador') {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error validando administrador:', error);
        this.authService.limpiarSesion();
        this.router.navigate(['/login']);
      }
    });
  }

  cargarUsuarios(): void {
    this.authService.obtenerUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);

        if (error.status === 403) {
          this.mensajeError = 'No tienes permisos para ver la gestión de usuarios.';
        } else {
          this.mensajeError = 'No se pudieron cargar los usuarios.';
        }
      }
    });
  }

  darBaja(usuario: any): void {
    const confirmar = confirm(`¿Deseas dar de baja al usuario ${usuario.nombre_completo}?`);

    if (!confirmar) {
      return;
    }

    this.authService.darBajaUsuario(usuario.id_usuario).subscribe({
      next: (response) => {
        this.mensajeExito = response.mensaje || 'Usuario dado de baja correctamente';
        this.mensajeError = '';
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error dando de baja:', error);
        this.mensajeError = error.error?.detail || 'No se pudo dar de baja al usuario.';
        this.mensajeExito = '';
      }
    });
  }

  volverDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}