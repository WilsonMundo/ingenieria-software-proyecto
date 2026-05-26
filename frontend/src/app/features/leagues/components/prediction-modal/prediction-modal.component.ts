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

  constructor(
    public dialogRef: MatDialogRef<PredictionModalComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private leaguesService: LeaguesService
  ) {}

  save(): void {
    const payload = {
      id_partido: Number(this.data.id_partido),
      goles_local_pred: Number(this.golesLocal),
      goles_visitante_pred: Number(this.golesVisitante)
    };
    this.leaguesService.createPrediction(
      this.data.id_liga,
      payload
    ).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}