import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EstadioService } from '../../../../../services/estadio.service';
import { SedeService } from '../../../../../services/sede.service';
import { Estadio } from '../../../../../models/dto/estadio.dto';
import { Sede } from '../../../../../models/dto/sede.dto';

@Component({
  selector: 'app-estadio-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './estadio-dialog-componente.html',
  styleUrl: './estadio-dialog-componente.css',
})
export class EstadioDialogComponente implements OnInit {
  form!: FormGroup;
  guardando = false;
  esEdicion = false;
  sedes: Sede[] = [];

  constructor(
    private fb: FormBuilder,
    private estadioService: EstadioService,
    private sedeService: SedeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EstadioDialogComponente>,
    @Inject(MAT_DIALOG_DATA) public data: Estadio | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      id_sede:   [this.data?.id_sede ?? '', Validators.required],
      nombre:    [this.data?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
      capacidad: [this.data?.capacidad ?? null],
    });
    this.sedeService.getAll().subscribe((s) => (this.sedes = s));
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const accion$ = this.esEdicion
      ? this.estadioService.update(this.data!.id_estadio, this.form.value)
      : this.estadioService.create(this.form.value);
    accion$.subscribe({
      next: () => { this.snackBar.open(this.esEdicion ? 'Estadio actualizado' : 'Estadio creado', 'Cerrar', { duration: 3000, panelClass: ['snack-success'] }); this.dialogRef.close(true); },
      error: () => { this.snackBar.open('Error al guardar el estadio', 'Cerrar', { duration: 3500, panelClass: ['snack-error'] }); this.guardando = false; },
    });
  }

  cancelar(): void { this.dialogRef.close(false); }
}
