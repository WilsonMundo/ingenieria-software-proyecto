import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LeaguesService } from '../../services/leagues.service';

@Component({
  selector: 'app-create-league',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,

    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  templateUrl: './create-league.component.html',
  styleUrls: ['./create-league.component.css']
})
export class CreateLeagueComponent {

  leagueForm: FormGroup;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private leaguesService: LeaguesService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {

    this.leagueForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo_liga: ['privada', Validators.required],
      precio_participacion: [0],
      nombre_equipo: ['', [Validators.required, Validators.minLength(3)]]
    });

  }

  crearLiga(): void {

    if (this.leagueForm.invalid) {
      this.leagueForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.leaguesService.createLeague(
      this.leagueForm.value
    ).subscribe({

      next: () => {

        this.snackBar.open(
          'Liga creada correctamente',
          'Cerrar',
          {
            duration: 3000
          }
        );

        this.router.navigate(['/principal/ligas']);
      },

      error: (error) => {

        console.error(error);

        this.snackBar.open(
          error?.error?.detail || 'Error al crear liga',
          'Cerrar',
          {
            duration: 4000
          }
        );

        this.loading = false;
      }
    });

  }

}