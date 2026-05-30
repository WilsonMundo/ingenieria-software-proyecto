import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../../services/auth-service';
import { ClasificacionItem, ClasificacionResponse } from '../../../models/dto/clasificacion';
import { Partido } from '../../../models/dto/partido.dto';
import { ClasificacionService } from '../../../services/clasificacion.service';
import { PartidoService } from '../../../services/partido.service';
import { LeaguesService } from '../../../features/leagues/services/leagues.service';
import { League } from '../../../features/leagues/interfaces/league.interface';

interface LigaDashboard extends League {
  miembros_activos: number;
  posicion_usuario: number | null;
  puntos_usuario: number;
}

interface RankingDashboard extends ClasificacionItem {
  iniciales: string;
  esUsuarioActual: boolean;
}

@Component({
  selector: 'app-dashboard-componente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard-componente.html',
  styleUrl: './dashboard-componente.css'
})
export class DashboardComponente implements OnInit {
  usuario: any = null;
  ligas: LigaDashboard[] = [];
  ranking: RankingDashboard[] = [];
  proximoPartido: Partido | null = null;
  puntosTotales = 0;
  posicionActual: number | null = null;
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private leaguesService: LeaguesService,
    private clasificacionService: ClasificacionService,
    private partidoService: PartidoService
  ) {}

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = this.authService.obtenerUsuario();
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.cargando = true;

    forkJoin({
      ligas: this.leaguesService.getLeagues().pipe(catchError(() => of([] as League[]))),
      partidos: this.partidoService.getAll().pipe(catchError(() => of([] as Partido[])))
    }).subscribe({
      next: ({ ligas, partidos }) => {
        this.proximoPartido = this.obtenerProximoPartido(partidos);
        this.cargarClasificaciones(ligas);
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  private cargarClasificaciones(ligas: League[]): void {
    if (ligas.length === 0) {
      this.ligas = [];
      this.ranking = [];
      this.puntosTotales = 0;
      this.posicionActual = null;
      this.cargando = false;
      return;
    }

    const consultas = ligas.map((liga) =>
      this.clasificacionService.obtenerClasificacion(liga.id_liga).pipe(
        catchError(() => of({
          id_liga: liga.id_liga,
          nombre_liga: liga.nombre,
          total_miembros: 0,
          fecha_calculo: '',
          clasificacion: []
        } as ClasificacionResponse))
      )
    );

    forkJoin(consultas).subscribe({
      next: (clasificaciones) => {
        this.ligas = ligas.map((liga, index) =>
          this.mapearLigaDashboard(liga, clasificaciones[index])
        );

        this.puntosTotales = this.ligas.reduce((total, liga) => total + liga.puntos_usuario, 0);
        this.posicionActual = this.obtenerMejorPosicion(this.ligas);
        this.ranking = this.mapearRanking(clasificaciones[0]?.clasificacion ?? []);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  private mapearLigaDashboard(liga: League, clasificacion: ClasificacionResponse): LigaDashboard {
    const filaUsuario = this.buscarFilaUsuario(clasificacion.clasificacion);

    return {
      ...liga,
      miembros_activos: clasificacion.total_miembros || clasificacion.clasificacion.length,
      posicion_usuario: filaUsuario?.posicion ?? null,
      puntos_usuario: filaUsuario?.puntos ?? 0
    };
  }

  private buscarFilaUsuario(clasificacion: ClasificacionItem[]): ClasificacionItem | undefined {
    return clasificacion.find((fila) => fila.id_usuario === this.usuario?.id_usuario);
  }

  private obtenerMejorPosicion(ligas: LigaDashboard[]): number | null {
    const posiciones = ligas
      .map((liga) => liga.posicion_usuario)
      .filter((posicion): posicion is number => posicion !== null);

    return posiciones.length ? Math.min(...posiciones) : null;
  }

  private mapearRanking(clasificacion: ClasificacionItem[]): RankingDashboard[] {
    return clasificacion.slice(0, 5).map((fila) => ({
      ...fila,
      iniciales: this.obtenerIniciales(fila.nombre_usuario),
      esUsuarioActual: fila.id_usuario === this.usuario?.id_usuario
    }));
  }

  private obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('') || 'US';
  }

  private obtenerProximoPartido(partidos: Partido[]): Partido | null {
    const ahora = new Date().getTime();
    const ordenados = [...partidos].sort(
      (a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime()
    );

    return ordenados.find((partido) =>
      partido.estado_partido !== 'finalizado' &&
      new Date(partido.fecha_hora_inicio).getTime() >= ahora
    ) ?? ordenados[0] ?? null;
  }

  esLigaApuesta(liga: League): boolean {
    return liga.tipo_liga?.toLowerCase() === 'apuesta';
  }

  premioLiga(liga: LigaDashboard): string {
    const precio = Number(liga.precio_participacion);
    return this.esLigaApuesta(liga) && precio > 0 ? `Q${precio.toFixed(2)}` : 'Sin premio';
  }

  formatoPosicion(posicion: number | null): string {
    return posicion ? `#${posicion}` : '-';
  }

  etiquetaPosicionResumen(): string {
    return this.posicionActual ? `#${this.posicionActual}` : '-';
  }

  movimientoTexto(item: RankingDashboard): string {
    if (item.movimiento > 0) return `+${item.movimiento}`;
    if (item.movimiento < 0) return `${item.movimiento}`;
    return '-';
  }
}
