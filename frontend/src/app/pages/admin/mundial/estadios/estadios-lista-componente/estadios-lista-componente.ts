import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EstadioService } from '../../../../../services/estadio.service';
import { Estadio } from '../../../../../models/dto/estadio.dto';
import { EstadioDialogComponente } from '../estadio-dialog-componente/estadio-dialog-componente';

@Component({
  selector: 'app-estadios-lista',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './estadios-lista-componente.html',
  styleUrl: './estadios-lista-componente.css',
})
export class EstadiosListaComponente implements OnInit {
  estadios: Estadio[] = [];
  columnas = ['id_estadio', 'nombre', 'sede', 'capacidad', 'acciones'];
  cargando = false;

  constructor(private estadioService: EstadioService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.cargarEstadios(); }

  cargarEstadios(): void {
    this.cargando = true;
    this.estadioService.getAll().subscribe({
      next: (data) => { this.estadios = data; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar estadios', true); this.cargando = false; },
    });
  }

  abrirDialog(estadio?: Estadio): void {
    const ref = this.dialog.open(EstadioDialogComponente, { width: '480px', data: estadio ?? null });
    ref.afterClosed().subscribe((r) => { if (r) this.cargarEstadios(); });
  }

  eliminar(e: Estadio): void {
    if (!confirm(`¿Eliminar el estadio "${e.nombre}"?`)) return;
    this.estadioService.delete(e.id_estadio).subscribe({
      next: () => { this.mostrarMensaje('Estadio eliminado'); this.cargarEstadios(); },
      error: () => this.mostrarMensaje('Error al eliminar estadio', true),
    });
  }

  private mostrarMensaje(msg: string, error = false): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3500, panelClass: error ? ['snack-error'] : ['snack-success'] });
  }
}
