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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PartidoService } from '../../../../../services/partido.service';
import { FaseService } from '../../../../../services/fase.service';
import { GrupoService } from '../../../../../services/grupo.service';
import { EstadioService } from '../../../../../services/estadio.service';
import { PaisService } from '../../../../../services/pais.service';
import { TorneoService } from '../../../../../services/torneo.service';
import { Partido, EstadoPartido } from '../../../../../models/dto/partido.dto';
import { Fase } from '../../../../../models/dto/fase.dto';
import { Grupo } from '../../../../../models/dto/grupo.dto';
import { Estadio } from '../../../../../models/dto/estadio.dto';
import { Pais } from '../../../../../models/dto/pais.dto';
import { Torneo } from '../../../../../models/dto/torneo.dto';

@Component({
  selector: 'app-partido-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatDatepickerModule, MatNativeDateModule],
  templateUrl: './partido-dialog-componente.html',
  styleUrl: './partido-dialog-componente.css',
})
export class PartidoDialogComponente implements OnInit {
  form!: FormGroup;
  guardando = false;
  esEdicion = false;
  torneos: Torneo[] = [];
  fases: Fase[] = [];
  grupos: Grupo[] = [];
  estadios: Estadio[] = [];
  paises: Pais[] = [];
  estados: EstadoPartido[] = ['programado', 'en_juego', 'finalizado', 'suspendido'];

  constructor(
    private fb: FormBuilder,
    private partidoService: PartidoService,
    private faseService: FaseService,
    private grupoService: GrupoService,
    private estadioService: EstadioService,
    private paisService: PaisService,
    private torneoService: TorneoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PartidoDialogComponente>,
    @Inject(MAT_DIALOG_DATA) public data: Partido | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      id_torneo:          [this.data?.id_torneo ?? '', Validators.required],
      id_fase:            [this.data?.id_fase ?? '', Validators.required],
      id_grupo:           [this.data?.id_grupo ?? null],
      id_estadio:         [this.data?.id_estadio ?? '', Validators.required],
      id_equipo_local:    [this.data?.id_equipo_local ?? '', Validators.required],
      id_equipo_visitante:[this.data?.id_equipo_visitante ?? '', Validators.required],
      fecha_hora_inicio:  [this.data?.fecha_hora_inicio ? new Date(this.data.fecha_hora_inicio) : '', Validators.required],
      hora_inicio:        [this.data?.fecha_hora_inicio ? new Date(this.data.fecha_hora_inicio).toTimeString().slice(0,5) : '12:00'],
      estado_partido:     [this.data?.estado_partido ?? 'programado', Validators.required],
    });
    this.torneoService.getAll().subscribe((t) => (this.torneos = t));
    this.faseService.getAll().subscribe((f) => (this.fases = f));
    this.grupoService.getAll().subscribe((g) => (this.grupos = g));
    this.estadioService.getAll().subscribe((e) => (this.estadios = e));
    this.paisService.getAll().subscribe((p) => (this.paises = p));
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const val = this.form.value;
    const fecha: Date = val.fecha_hora_inicio;
    const [h, m] = (val.hora_inicio as string).split(':');
    fecha.setHours(+h, +m, 0, 0);
    const payload = { ...val, fecha_hora_inicio: fecha.toISOString() };
    delete payload.hora_inicio;

    const accion$ = this.esEdicion
      ? this.partidoService.update(this.data!.id_partido, payload)
      : this.partidoService.create(payload);

    accion$.subscribe({
      next: () => { this.snackBar.open(this.esEdicion ? 'Partido actualizado' : 'Partido creado', 'Cerrar', { duration: 3000, panelClass: ['snack-success'] }); this.dialogRef.close(true); },
      error: () => { this.snackBar.open('Error al guardar el partido', 'Cerrar', { duration: 3500, panelClass: ['snack-error'] }); this.guardando = false; },
    });
  }
  cancelar(): void { this.dialogRef.close(false); }
}
