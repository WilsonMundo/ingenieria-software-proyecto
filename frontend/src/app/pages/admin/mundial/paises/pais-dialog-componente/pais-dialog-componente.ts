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
import { PaisService } from '../../../../../services/pais.service';
import { GrupoService } from '../../../../../services/grupo.service';
import { Pais } from '../../../../../models/dto/pais.dto';
import { Grupo } from '../../../../../models/dto/grupo.dto';

@Component({
  selector: 'app-pais-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './pais-dialog-componente.html',
  styleUrl: './pais-dialog-componente.css',
})
export class PaisDialogComponente implements OnInit {
  form!: FormGroup;
  guardando = false;
  esEdicion = false;
  grupos: Grupo[] = [];

  constructor(
    private fb: FormBuilder, private paisService: PaisService, private grupoService: GrupoService,
    private snackBar: MatSnackBar, public dialogRef: MatDialogRef<PaisDialogComponente>,
    @Inject(MAT_DIALOG_DATA) public data: Pais | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      nombre:        [this.data?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
      codigo_fifa:   [this.data?.codigo_fifa ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      confederacion: [this.data?.confederacion ?? ''],
      id_grupo:      [this.data?.id_grupo ?? null],
    });
    this.grupoService.getAll().subscribe((g) => (this.grupos = g));
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const accion$ = this.esEdicion
      ? this.paisService.update(this.data!.id_pais, this.form.value)
      : this.paisService.create(this.form.value);
    accion$.subscribe({
      next: () => { this.snackBar.open(this.esEdicion ? 'País actualizado' : 'País creado', 'Cerrar', { duration: 3000, panelClass: ['snack-success'] }); this.dialogRef.close(true); },
      error: (error) => {
        const mensaje = error?.error?.detail ?? 'Error al guardar';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3500, panelClass: ['snack-error'] });
        this.guardando = false;
      },
    });
  }
  cancelar(): void { this.dialogRef.close(false); }
}
