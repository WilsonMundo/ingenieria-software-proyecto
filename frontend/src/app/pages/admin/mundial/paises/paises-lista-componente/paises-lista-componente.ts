import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaisService } from '../../../../../services/pais.service';
import { Pais } from '../../../../../models/dto/pais.dto';
import { PaisDialogComponente } from '../pais-dialog-componente/pais-dialog-componente';

@Component({
  selector: 'app-paises-lista',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './paises-lista-componente.html',
  styleUrl: './paises-lista-componente.css',
})
export class PaisesListaComponente implements OnInit {
  paises: Pais[] = [];
  columnas = ['id_pais', 'nombre', 'codigo_fifa', 'confederacion', 'grupo', 'acciones'];
  cargando = false;
  constructor(private paisService: PaisService, private dialog: MatDialog, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.cargarPaises(); }
  cargarPaises(): void {
    this.cargando = true;
    this.paisService.getAll().subscribe({
      next: (d) => { this.paises = d; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar países', true); this.cargando = false; },
    });
  }
  abrirDialog(pais?: Pais): void {
    const ref = this.dialog.open(PaisDialogComponente, { width: '500px', data: pais ?? null });
    ref.afterClosed().subscribe((r) => { if (r) this.cargarPaises(); });
  }
  eliminar(p: Pais): void {
    if (!confirm(`¿Eliminar a "${p.nombre}"?`)) return;
    this.paisService.delete(p.id_pais).subscribe({ next: () => { this.mostrarMensaje('País eliminado'); this.cargarPaises(); }, error: () => this.mostrarMensaje('Error al eliminar', true) });
  }
  private mostrarMensaje(msg: string, error = false): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3500, panelClass: error ? ['snack-error'] : ['snack-success'] });
  }
}
