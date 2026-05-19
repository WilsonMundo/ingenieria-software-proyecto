import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InvitacionService } from '../../../services/invitacion-service';

@Component({
  selector: 'app-enviar-invitacion-componente',
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
  templateUrl: './enviar-invitacion-componente.html',
  styleUrl: './enviar-invitacion-componente.css'
})
export class EnviarInvitacionComponente {
  idLiga: number = 1;
  emailDestino: string = '';

  mensajeExito: string = '';
  mensajeError: string = '';
  enlaceGenerado: string = '';
  usuarioRegistrado: boolean | null = null;

  constructor(private invitacionService: InvitacionService) {}

  enviarInvitacion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    this.enlaceGenerado = '';
    this.usuarioRegistrado = null;

    const data = {
      id_liga: Number(this.idLiga),
      email_destino: this.emailDestino.trim()
    };

    console.log('Invitación enviada desde Angular:', data);

    this.invitacionService.enviarInvitacion(data).subscribe({
      next: (response) => {
        console.log('Respuesta invitación:', response);

        this.mensajeExito = response.mensaje;
        this.enlaceGenerado = response.enlace;
        this.usuarioRegistrado = response.usuario_registrado;
      },
      error: (error) => {
        console.error('Error enviando invitación:', error);

        if (error.status === 404) {
          this.mensajeError = error.error.detail || 'La liga indicada no existe';
        } else {
          this.mensajeError = 'No se pudo enviar la invitación';
        }
      }
    });
  }
}