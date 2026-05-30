import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SedeService } from '../../../../../services/sede.service';
import { Sede } from '../../../../../models/dto/sede.dto';
import { SedeDialogComponente } from '../sede-dialog-componente/sede-dialog-componente';

@Component({
  selector: 'app-sedes-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './sedes-lista-componente.html',
  styleUrl: './sedes-lista-componente.css',
})
export class SedesListaComponente implements OnInit {
  sedes: Sede[] = [];
  columnas = ['id_sede', 'nombre', 'ciudad', 'pais_sede', 'acciones'];
  cargando = false;

  constructor(
    private sedeService: SedeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.cargando = true;
    this.sedeService.getAll().subscribe({
      next: (data) => { this.sedes = data; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar sedes', true); this.cargando = false; },
    });
  }

  abrirDialog(sede?: Sede): void {
    const ref = this.dialog.open(SedeDialogComponente, {
      width: '480px',
      data: sede ?? null,
    });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) this.cargarSedes();
    });
  }

  eliminar(sede: Sede): void {
    if (!confirm(`¿Deseas eliminar la sede "${sede.nombre}"?`)) return;
    this.sedeService.delete(sede.id_sede).subscribe({
      next: () => { this.mostrarMensaje('Sede eliminada correctamente'); this.cargarSedes(); },
      error: () => this.mostrarMensaje('Error al eliminar sede', true),
    });
  }

  private mostrarMensaje(msg: string, error = false): void {
    this.snackBar.open(msg, 'Cerrar', {
      duration: 3500,
      panelClass: error ? ['snack-error'] : ['snack-success'],
    });
  }
}
