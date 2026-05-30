import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../services/auth-service';

@Component({
  selector: 'app-olvido-contrasenia-componente',
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
  templateUrl: './olvido-contrasenia-componente.html',
  styleUrl: './olvido-contrasenia-componente.css',
})
export class OlvidoContraseniaComponente {
 email: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(private authService: AuthService) {}

  enviarRecuperacion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    const data = {
      email: this.email.trim()
    };

    console.log('Solicitud recuperación:', data);

    this.authService.olvidoContrasenia(data).subscribe({
      next: (response) => {
        console.log('Respuesta recuperación:', response);
        this.mensajeExito = response.mensaje;
      },
      error: (error) => {
        console.error('Error recuperación:', error);
        this.mensajeError = 'No se pudo procesar la solicitud';
      }
    });
  }
}
