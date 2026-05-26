import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ResultadoOficialService } from '../../../../../services/resultado-oficial.service';
import { PartidoService } from '../../../../../services/partido.service';
import { ResultadoOficial } from '../../../../../models/dto/resultado-oficial.dto';
import { Partido } from '../../../../../models/dto/partido.dto';

@Component({
  selector: 'app-resultado-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule, MatCheckboxModule],
  templateUrl: './resultado-dialog-componente.html',
  styleUrl: './resultado-dialog-componente.css',
})
export class ResultadoDialogComponente implements OnInit {
  form!: FormGroup;
  guardando = false;
  esEdicion = false;
  partidos: Partido[] = [];

  constructor(
    private fb: FormBuilder,
    private resultadoService: ResultadoOficialService,
    private partidoService: PartidoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ResultadoDialogComponente>,
    @Inject(MAT_DIALOG_DATA) public data: ResultadoOficial | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      id_partido:       [this.data?.id_partido ?? '', Validators.required],
      goles_local:      [this.data?.goles_local ?? 0, [Validators.required, Validators.min(0)]],
      goles_visitante:  [this.data?.goles_visitante ?? 0, [Validators.required, Validators.min(0)]],
      bloqueado:        [this.data?.bloqueado ?? false],
    });
    // Solo mostrar partidos finalizados o en juego para ingresar resultado
    this.partidoService.getAll().subscribe((p) => {
      this.partidos = p.filter((partido) => ['en_juego', 'finalizado', 'programado'].includes(partido.estado_partido));
    });
  }

  get nombrePartido(): string {
    const idPartido = this.form.get('id_partido')?.value;
    const p = this.partidos.find((x) => x.id_partido === idPartido);
    if (!p) return '';
    return `${p.equipo_local?.nombre ?? '?'} vs ${p.equipo_visitante?.nombre ?? '?'}`;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const payload = this.form.value;
    const accion$ = this.esEdicion
      ? this.resultadoService.update(this.data!.id_resultado, payload)
      : this.resultadoService.create(payload);
    accion$.subscribe({
      next: () => { this.snackBar.open(this.esEdicion ? 'Resultado actualizado' : '¡Resultado registrado! Se calculan puntos automáticamente.', 'Cerrar', { duration: 4000, panelClass: ['snack-success'] }); this.dialogRef.close(true); },
      error: () => { this.snackBar.open('Error al guardar el resultado', 'Cerrar', { duration: 3500, panelClass: ['snack-error'] }); this.guardando = false; },
    });
  }
  cancelar(): void { this.dialogRef.close(false); }
}
