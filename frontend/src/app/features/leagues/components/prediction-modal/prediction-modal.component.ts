import { Component, Inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { LeaguesService } from '../../services/leagues.service';

@Component({
  selector: 'app-prediction-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './prediction-modal.component.html',
  styleUrls: ['./prediction-modal.component.css']
})
export class PredictionModalComponent {

  golesLocal: number = 0;
  golesVisitante: number = 0;
  guardando = false;
  mensajeError = '';

  constructor(
    public dialogRef: MatDialogRef<PredictionModalComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private leaguesService: LeaguesService
  ) {
    this.golesLocal = Number(this.data.goles_local_pred ?? 0);
    this.golesVisitante = Number(this.data.goles_visitante_pred ?? 0);
  }

  get nombreLocal(): string {
    return this.data.nombre_local ?? this.data.equipo_local ?? this.partesEncuentro()[0] ?? 'Local';
  }

  get nombreVisitante(): string {
    return this.data.nombre_visitante ?? this.data.equipo_visitante ?? this.partesEncuentro()[1] ?? 'Visitante';
  }

  get fechaPartido(): string {
    return this.data.fecha_hora_inicio ?? this.data.fecha_y_hora ?? '';
  }

  save(): void {
    this.mensajeError = '';

    if (this.guardando) {
      return;
    }

    const golesLocal = Number(this.golesLocal);
    const golesVisitante = Number(this.golesVisitante);

    if (!Number.isInteger(golesLocal) || !Number.isInteger(golesVisitante)) {
      this.mensajeError = 'Ingresa goles validos en numeros enteros.';
      return;
    }

    if (golesLocal < 0 || golesVisitante < 0) {
      this.mensajeError = 'Los goles no pueden ser negativos.';
      return;
    }

    const payload = {
      id_partido: Number(this.data.id_partido),
      goles_local_pred: golesLocal,
      goles_visitante_pred: golesVisitante
    };

    this.guardando = true;
    this.leaguesService.createPrediction(
      this.data.id_liga,
      payload
    ).subscribe({
      next: (response) => {
        this.guardando = false;
        this.dialogRef.close({
          ...response,
          id_liga: Number(this.data.id_liga),
          id_partido: Number(this.data.id_partido),
          goles_local_pred: golesLocal,
          goles_visitante_pred: golesVisitante
        });
      },
      error: (error) => {
        console.error(error);
        this.guardando = false;
        this.mensajeError = error.error?.detail ?? 'No se pudo guardar el vaticinio.';
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  private partesEncuentro(): string[] {
    return String(this.data.encuentro ?? '')
      .split(/\s+vs\s+/i)
      .map((parte) => parte.trim())
      .filter(Boolean);
  }

}
