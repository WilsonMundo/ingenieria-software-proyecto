import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PredictionModalComponent } from '../../features/leagues/components/prediction-modal/prediction-modal.component';
import { VaticinioService } from '../../services/Vaticinio.service';

type EstadoPartido = 'ABIERTO' | 'CERRADO' | 'EN_VIVO' | 'FINALIZADO';
type FiltroPrediccion = 'TODAS' | 'SIN_PREDECIR' | 'PREDICHAS' | 'FINALIZADAS';

interface PartidoVaticinioDTO {
  id_liga_miembro: number;
  id_liga: number;
  liga_nombre: string;
  id_partido: number;
  fecha_hora_inicio: string;
  estado_partido: EstadoPartido;
  id_equipo_local: number;
  id_equipo_visitante: number;
  nombre_local: string;
  codigo_local: string;
  nombre_visitante: string;
  codigo_visitante: string;
  ha_predicho: boolean;
  goles_local_pred?: number | null;
  goles_visitante_pred?: number | null;
  puntos: number;
  acerto_resultado: boolean;
  acerto_marcador: boolean;
}

interface EstadisticasPredicciones {
  total: number;
  pendientes: number;
  correctas: number;
  precision: number;
}

@Component({
  selector: 'app-predicciones',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './predicciones.component.html',
  styleUrls: ['./predicciones.component.css']
})
export class PrediccionesComponent implements OnInit {
  filtroActivo: FiltroPrediccion = 'TODAS';
  busquedaQuery = '';
  cargando = false;
  mensajeError = '';

  partidos: PartidoVaticinioDTO[] = [];
  estadisticas: EstadisticasPredicciones = {
    total: 0,
    pendientes: 0,
    correctas: 0,
    precision: 0
  };

  constructor(
    private vaticinioService: VaticinioService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPredicciones();
  }

  cargarPredicciones(silencioso = false): void {
    if (!silencioso) {
      this.cargando = true;
    }
    this.mensajeError = '';

    this.vaticinioService.listarPredicciones().subscribe({
      next: (response) => {
        this.partidos = [...(response.predicciones ?? [])];
        this.estadisticas = response.estadisticas ?? this.calcularEstadisticas(this.partidos);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.mensajeError = error.error?.detail ?? 'No se pudieron cargar tus predicciones.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get partidosFiltrados(): PartidoVaticinioDTO[] {
    const termino = this.busquedaQuery.trim().toLowerCase();

    return this.partidos.filter((partido) => {
      const cumpleFiltro =
        this.filtroActivo === 'TODAS' ||
        (this.filtroActivo === 'SIN_PREDECIR' && !partido.ha_predicho && partido.estado_partido !== 'FINALIZADO') ||
        (this.filtroActivo === 'PREDICHAS' && partido.ha_predicho) ||
        (this.filtroActivo === 'FINALIZADAS' && partido.estado_partido === 'FINALIZADO');

      const textoBusqueda = `${partido.liga_nombre} ${partido.nombre_local} ${partido.nombre_visitante}`.toLowerCase();
      return cumpleFiltro && (!termino || textoBusqueda.includes(termino));
    });
  }

  cambiarFiltro(nuevoFiltro: FiltroPrediccion): void {
    this.filtroActivo = nuevoFiltro;
  }

  onSearch(event: Event): void {
    this.busquedaQuery = (event.target as HTMLInputElement).value;
  }

  abrirPrediccion(partido: PartidoVaticinioDTO): void {
    this.dialog.open(PredictionModalComponent, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        id_liga: partido.id_liga,
        id_partido: partido.id_partido,
        encuentro: `${partido.nombre_local} vs ${partido.nombre_visitante}`,
        fecha_y_hora: partido.fecha_hora_inicio,
        nombre_local: partido.nombre_local,
        nombre_visitante: partido.nombre_visitante,
        goles_local_pred: partido.goles_local_pred,
        goles_visitante_pred: partido.goles_visitante_pred
      }
    }).afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.actualizarPrediccionLocal(resultado);
        setTimeout(() => this.cargarPredicciones(true), 150);
      }
    });
  }

  puedePredecir(partido: PartidoVaticinioDTO): boolean {
    return partido.estado_partido !== 'FINALIZADO' && partido.estado_partido !== 'CERRADO';
  }

  trackByPrediccion(_: number, partido: PartidoVaticinioDTO): string {
    return `${partido.id_liga_miembro}-${partido.id_partido}`;
  }

  private actualizarPrediccionLocal(resultado: {
    id_liga: number;
    id_partido: number;
    goles_local_pred: number;
    goles_visitante_pred: number;
  }): void {
    this.partidos = this.partidos.map((partido) => {
      if (partido.id_liga !== resultado.id_liga || partido.id_partido !== resultado.id_partido) {
        return partido;
      }

      return {
        ...partido,
        ha_predicho: true,
        goles_local_pred: resultado.goles_local_pred,
        goles_visitante_pred: resultado.goles_visitante_pred
      };
    });

    this.estadisticas = this.calcularEstadisticas(this.partidos);
    this.cdr.detectChanges();
  }

  private calcularEstadisticas(partidos: PartidoVaticinioDTO[]): EstadisticasPredicciones {
    const predichas = partidos.filter((partido) => partido.ha_predicho).length;
    const correctas = partidos.filter((partido) => partido.acerto_resultado).length;

    return {
      total: partidos.length,
      pendientes: partidos.filter((partido) => !partido.ha_predicho && partido.estado_partido !== 'FINALIZADO').length,
      correctas,
      precision: predichas ? Math.round((correctas / predichas) * 100) : 0
    };
  }
}
