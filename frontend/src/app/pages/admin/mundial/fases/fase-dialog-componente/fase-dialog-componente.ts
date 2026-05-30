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
import { FaseService } from '../../../../../services/fase.service';
import { TorneoService } from '../../../../../services/torneo.service';
import { Fase } from '../../../../../models/dto/fase.dto';
import { Torneo } from '../../../../../models/dto/torneo.dto';

@Component({
  selector: 'app-fase-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './fase-dialog-componente.html',
  styleUrl: './fase-dialog-componente.css',
})
export class FaseDialogComponente implements OnInit {
  form!: FormGroup;
  guardando = false;
  esEdicion = false;
  torneos: Torneo[] = [];
  constructor(private fb: FormBuilder, private faseService: FaseService, private torneoService: TorneoService,
    private snackBar: MatSnackBar, public dialogRef: MatDialogRef<FaseDialogComponente>,
    @Inject(MAT_DIALOG_DATA) public data: Fase | null) {}
  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      id_torneo:  [this.data?.id_torneo ?? '', Validators.required],
      nombre:     [this.data?.nombre ?? '', [Validators.required, Validators.maxLength(50)]],
      orden_fase: [this.data?.orden_fase ?? 1, [Validators.required, Validators.min(1)]],
    });
    this.torneoService.getAll().subscribe((t) => (this.torneos = t));
  }
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const accion$ = this.esEdicion ? this.faseService.update(this.data!.id_fase, this.form.value) : this.faseService.create(this.form.value);
    accion$.subscribe({ next: () => { this.snackBar.open(this.esEdicion ? 'Fase actualizada' : 'Fase creada', 'Cerrar', { duration: 3000, panelClass: ['snack-success'] }); this.dialogRef.close(true); }, error: () => { this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3500, panelClass: ['snack-error'] }); this.guardando = false; } });
  }
  cancelar(): void { this.dialogRef.close(false); }
}
