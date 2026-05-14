import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-registro-componente',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './registro-componente.html',
  styleUrl: './registro-componente.css',
})
export class RegistroComponente {
   nombreCompleto: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';
  aceptaTerminos: boolean = false;

  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  crearCuenta(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.passwordsCoinciden()) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    const data = {
      nombre_completo: this.nombreCompleto.trim(),
      email: this.email.trim(),
      password: this.password.trim()
    };

    console.log('Registro enviado:', data);

    this.authService.registro(data).subscribe({
      next: (response) => {
        console.log('Registro correcto:', response);
        this.mensajeExito = response.mensaje || 'Usuario registrado exitosamente';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error) => {
        console.error('Error en registro:', error);

        if (error.status === 400) {
          this.mensajeError = error.error.detail || 'El correo ya está registrado';
        } else {
          this.mensajeError = 'Ocurrió un error al registrar el usuario';
        }
      }
    });
  }

  passwordsCoinciden(): boolean {
    return this.password === this.confirmarPassword;
  }
}
