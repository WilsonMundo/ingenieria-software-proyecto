import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GrupoService } from '../../../../../services/grupo.service';
import { Grupo } from '../../../../../models/dto/grupo.dto';
import { GrupoDialogComponente } from '../grupo-dialog-componente/grupo-dialog-componente';

@Component({
  selector: 'app-grupos-lista',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './grupos-lista-componente.html',
  styleUrl: './grupos-lista-componente.css',
})
export class GruposListaComponente implements OnInit {
  grupos: Grupo[] = [];
  columnas = ['id_grupo', 'nombre', 'torneo', 'acciones'];
  cargando = false;
  constructor(private grupoService: GrupoService, private dialog: MatDialog, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando = true;
    this.grupoService.getAll().subscribe({ next: (d) => { this.grupos = d; this.cargando = false; }, error: () => { this.snackBar.open('Error al cargar grupos', 'Cerrar', { duration: 3000 }); this.cargando = false; } });
  }
  abrirDialog(g?: Grupo): void { this.dialog.open(GrupoDialogComponente, { width: '440px', data: g ?? null }).afterClosed().subscribe((r) => { if (r) this.cargar(); }); }
  eliminar(g: Grupo): void {
    if (!confirm(`¿Eliminar grupo "${g.nombre}"?`)) return;
    this.grupoService.delete(g.id_grupo).subscribe({ next: () => { this.snackBar.open('Grupo eliminado', 'Cerrar', { duration: 3000 }); this.cargar(); }, error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }) });
  }
}
