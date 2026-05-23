import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-perfil-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './perfil-componente.html',
  styleUrl: './perfil-componente.css'
})
export class PerfilComponente implements OnInit {
  usuario: any = null;
  mostrarCambioPassword: boolean = false;

  passwordActual: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';

  mensajeError: string = '';
  mensajeExito: string = '';

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

      const usuarioStorage = {
        id_usuario: response.id_usuario,
        nombre_completo: response.nombre_completo,
        email: response.email,
        rol: response.rol
      };

      localStorage.setItem('usuario', JSON.stringify(usuarioStorage));
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

  toggleCambioPassword(): void {
    this.mostrarCambioPassword = !this.mostrarCambioPassword;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  cambiarPassword(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.passwordActual || !this.nuevaPassword || !this.confirmarPassword) {
      this.mensajeError = 'Completa todos los campos.';
      return;
    }

    if (this.nuevaPassword.length < 6) {
      this.mensajeError = 'La nueva contraseña debe tener mínimo 6 caracteres.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mensajeError = 'La nueva contraseña y la confirmación no coinciden.';
      return;
    }

    this.authService.cambiarPassword(this.passwordActual, this.nuevaPassword).subscribe({
      next: (response) => {
        this.mensajeExito = response.mensaje || 'Contraseña actualizada correctamente';

        this.passwordActual = '';
        this.nuevaPassword = '';
        this.confirmarPassword = '';
        this.mostrarCambioPassword = false;

        setTimeout(() => {
            this.mensajeExito = '';
          }, 3000);
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.mensajeError = error.error?.detail || 'No se pudo actualizar la contraseña.';
      }
    });
  }

  irDashboard(): void {
    this.router.navigate(['/dashboard']);
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

  esAdministrador(): boolean {
    return this.usuario?.rol === 'administrador';
  }

  irGestionUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}