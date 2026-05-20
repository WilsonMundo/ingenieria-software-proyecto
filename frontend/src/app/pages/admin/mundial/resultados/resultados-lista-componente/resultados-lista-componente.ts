import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ResultadoOficialService } from '../../../../../services/resultado-oficial.service';
import { ResultadoOficial } from '../../../../../models/dto/resultado-oficial.dto';
import { ResultadoDialogComponente } from '../resultado-dialog-componente/resultado-dialog-componente';

@Component({
  selector: 'app-resultados-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule, MatBadgeModule],
  templateUrl: './resultados-lista-componente.html',
  styleUrl: './resultados-lista-componente.css',
})
export class ResultadosListaComponente implements OnInit {
  resultados: ResultadoOficial[] = [];
  columnas = ['id_resultado', 'partido', 'marcador', 'fecha_registro', 'bloqueado', 'acciones'];
  cargando = false;
  constructor(private resultadoService: ResultadoOficialService, private dialog: MatDialog, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando = true;
    this.resultadoService.getAll().subscribe({ next: (d) => { this.resultados = d; this.cargando = false; }, error: () => { this.snackBar.open('Error al cargar resultados', 'Cerrar', { duration: 3000 }); this.cargando = false; } });
  }
  abrirDialog(r?: ResultadoOficial): void { this.dialog.open(ResultadoDialogComponente, { width: '480px', data: r ?? null }).afterClosed().subscribe((res) => { if (res) this.cargar(); }); }
  eliminar(r: ResultadoOficial): void {
    if (r.bloqueado) { this.snackBar.open('Este resultado está bloqueado y no puede eliminarse', 'Cerrar', { duration: 3500 }); return; }
    if (!confirm(`¿Eliminar resultado del partido #${r.id_partido}?`)) return;
    this.resultadoService.delete(r.id_resultado).subscribe({ next: () => { this.snackBar.open('Resultado eliminado', 'Cerrar', { duration: 3000 }); this.cargar(); }, error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }) });
  }
}
