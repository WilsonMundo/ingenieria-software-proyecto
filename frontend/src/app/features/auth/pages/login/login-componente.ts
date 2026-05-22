

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../../../services/auth-service';

@Component({
  selector: 'app-login-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink
  ],
  templateUrl: './login-componente.html',
  styleUrl: './login-componente.css'
})
export class LoginComponente {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  hidePassword: boolean = true;

  mensajeError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

 login(): void {
    this.mensajeError = '';

    const data = {
      email: this.email,
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (response) => {
        this.authService.guardarToken(response.access_token);
        console.log('Login correcto:', response);

        // Por ahora redirigimos a una ruta temporal.
        // Después creamos dashboard.
        alert(`Bienvenido ${response.usuario.nombre_completo}`);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.mensajeError = 'Correo o contraseña incorrectos';
      }
    });
  }
}