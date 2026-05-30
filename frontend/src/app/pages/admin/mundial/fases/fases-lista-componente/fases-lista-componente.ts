import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FaseService } from '../../../../../services/fase.service';
import { Fase } from '../../../../../models/dto/fase.dto';
import { FaseDialogComponente } from '../fase-dialog-componente/fase-dialog-componente';

@Component({
  selector: 'app-fases-lista',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './fases-lista-componente.html',
  styleUrl: './fases-lista-componente.css',
})
export class FasesListaComponente implements OnInit {
  fases: Fase[] = [];
  columnas = ['orden_fase', 'nombre', 'torneo', 'acciones'];
  cargando = false;
  constructor(private faseService: FaseService, private dialog: MatDialog, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando = true;
    this.faseService.getAll().subscribe({ next: (d) => { this.fases = d.sort((a, b) => a.orden_fase - b.orden_fase); this.cargando = false; }, error: () => { this.snackBar.open('Error al cargar fases', 'Cerrar', { duration: 3000 }); this.cargando = false; } });
  }
  abrirDialog(f?: Fase): void { this.dialog.open(FaseDialogComponente, { width: '440px', data: f ?? null }).afterClosed().subscribe((r) => { if (r) this.cargar(); }); }
  eliminar(f: Fase): void {
    if (!confirm(`¿Eliminar la fase "${f.nombre}"?`)) return;
    this.faseService.delete(f.id_fase).subscribe({ next: () => { this.snackBar.open('Fase eliminada', 'Cerrar', { duration: 3000 }); this.cargar(); }, error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }) });
  }
}
