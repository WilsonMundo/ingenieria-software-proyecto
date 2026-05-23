import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-reset-password-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reset-password-componente.html',
  styleUrl: './reset-password-componente.css'
})
export class ResetPasswordComponente implements OnInit {
  token: string = '';

  nuevaPassword: string = '';
  confirmarPassword: string = '';

  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.mensajeError = 'Token de recuperación no encontrado.';
    }
  }

  restablecerPassword(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.nuevaPassword || !this.confirmarPassword) {
      this.mensajeError = 'Completa todos los campos.';
      return;
    }

    if (this.nuevaPassword.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.resetPassword(this.token, this.nuevaPassword).subscribe({
      next: (response) => {
        this.mensajeExito = response.mensaje || 'Contraseña actualizada correctamente.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (error) => {
        console.error('Error restableciendo contraseña:', error);
        this.mensajeError = error.error?.detail || 'No se pudo restablecer la contraseña.';
      }
    });
  }
}