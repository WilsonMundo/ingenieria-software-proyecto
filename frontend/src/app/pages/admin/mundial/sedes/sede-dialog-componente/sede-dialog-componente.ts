import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SedeService } from '../../../../../services/sede.service';
import { Sede } from '../../../../../models/dto/sede.dto';

@Component({
  selector: 'app-sede-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './sede-dialog-componente.html',
  styleUrl: './sede-dialog-componente.css',
})
export class SedeDialogComponente implements OnInit {
  form!: FormGroup;
  guardando = false;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private sedeService: SedeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SedeDialogComponente>,
    @Inject(MAT_DIALOG_DATA) public data: Sede | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      nombre:    [this.data?.nombre    ?? '', [Validators.required, Validators.maxLength(100)]],
      ciudad:    [this.data?.ciudad    ?? '', [Validators.required, Validators.maxLength(100)]],
      pais_sede: [this.data?.pais_sede ?? '', [Validators.required, Validators.maxLength(100)]],
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const payload = this.form.value;

    const accion$ = this.esEdicion
      ? this.sedeService.update(this.data!.id_sede, payload)
      : this.sedeService.create(payload);

    accion$.subscribe({
      next: () => {
        this.snackBar.open(
          this.esEdicion ? 'Sede actualizada correctamente' : 'Sede creada correctamente',
          'Cerrar', { duration: 3000, panelClass: ['snack-success'] }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al guardar la sede', 'Cerrar', { duration: 3500, panelClass: ['snack-error'] });
        this.guardando = false;
      },
    });
  }

  cancelar(): void { this.dialogRef.close(false); }
}
