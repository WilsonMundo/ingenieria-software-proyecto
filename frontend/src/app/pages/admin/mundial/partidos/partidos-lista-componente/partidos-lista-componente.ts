import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { PartidoService } from '../../../../../services/partido.service';
import { Partido } from '../../../../../models/dto/partido.dto';
import { PartidoDialogComponente } from '../partido-dialog-componente/partido-dialog-componente';

@Component({
  selector: 'app-partidos-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule, MatChipsModule],
  templateUrl: './partidos-lista-componente.html',
  styleUrl: './partidos-lista-componente.css',
})
export class PartidosListaComponente implements OnInit {
  partidos: Partido[] = [];
  columnas = ['id_partido', 'equipos', 'fecha', 'estadio', 'fase', 'estado', 'acciones'];
  cargando = false;
  constructor(private partidoService: PartidoService, private dialog: MatDialog, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando = true;
    this.partidoService.getAll().subscribe({
      next: (d) => { this.partidos = d; this.cargando = false; },
      error: () => { this.snackBar.open('Error al cargar partidos', 'Cerrar', { duration: 3000 }); this.cargando = false; },
    });
  }
  abrirDialog(p?: Partido): void { this.dialog.open(PartidoDialogComponente, { width: '600px', data: p ?? null }).afterClosed().subscribe((r) => { if (r) this.cargar(); }); }
  eliminar(p: Partido): void {
    if (!confirm(`¿Eliminar partido ${p.equipo_local?.nombre ?? p.id_equipo_local} vs ${p.equipo_visitante?.nombre ?? p.id_equipo_visitante}?`)) return;
    this.partidoService.delete(p.id_partido).subscribe({ next: () => { this.snackBar.open('Partido eliminado', 'Cerrar', { duration: 3000 }); this.cargar(); }, error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }) });
  }
  estadoColor(estado: string): string {
    return { programado: 'primary', en_juego: 'accent', finalizado: '', suspendido: 'warn' }[estado] ?? '';
  }
}
