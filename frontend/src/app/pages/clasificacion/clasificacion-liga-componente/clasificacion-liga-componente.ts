import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClasificacionItem, ClasificacionResponse } from '../../../models/dto/clasificacion';
import { ClasificacionService } from '../../../services/clasificacion.service';

@Component({
  selector: 'app-clasificacion-liga-componente',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './clasificacion-liga-componente.html',
  styleUrl: './clasificacion-liga-componente.css'
})
export class ClasificacionLigaComponente implements OnInit {
  private destroyRef = inject(DestroyRef);

  idLiga = 1;
  clasificacion: ClasificacionResponse | null = null;
  busqueda = '';
  cargando = true;
  recalculando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private route: ActivatedRoute,
    private clasificacionService: ClasificacionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.idLiga = Number(params.get('idLiga') ?? 1);
          this.cargando = true;
          this.mensajeError = '';

          return timer(0, 5000).pipe(
            switchMap(() =>
              this.clasificacionService.obtenerClasificacion(this.idLiga).pipe(
                catchError((error) => {
                  this.mensajeError = error?.error?.detail || 'No se pudo cargar la clasificacion';
                  this.cargando = false;
                  return of(null);
                })
              )
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((respuesta) => {
        if (!respuesta) {
          return;
        }

        this.clasificacion = respuesta;
        this.cargando = false;
      });
  }

  get jugadoresFiltrados(): ClasificacionItem[] {
    const jugadores = this.clasificacion?.clasificacion ?? [];
    const termino = this.busqueda.trim().toLowerCase();

    if (!termino) {
      return jugadores;
    }

    return jugadores.filter((miembro) =>
      `${miembro.nombre_usuario} ${miembro.nombre_equipo}`.toLowerCase().includes(termino)
    );
  }

  get lider(): ClasificacionItem | null {
    return this.clasificacion?.clasificacion[0] ?? null;
  }

  get totalAciertosLider(): number {
    return this.lider ? this.lider.aciertos_exactos + this.lider.aciertos_resultado : 0;
  }

  get precisionLider(): number {
    if (!this.lider || this.totalAciertosLider === 0) {
      return 0;
    }

    return Math.round((this.lider.aciertos_resultado / this.totalAciertosLider) * 100);
  }

  actualizarBusqueda(event: Event): void {
    this.busqueda = (event.target as HTMLInputElement).value;
  }

  refrescar(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.clasificacionService
      .obtenerClasificacion(this.idLiga)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.clasificacion = respuesta;
          this.cargando = false;
        },
        error: (error) => {
          this.mensajeError = error?.error?.detail || 'No se pudo actualizar la tabla';
          this.cargando = false;
        }
      });
  }

  recalcular(): void {
    this.recalculando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.clasificacionService
      .recalcular(this.idLiga)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito = `${respuesta.mensaje}. Historicos creados: ${respuesta.historicos_creados}`;
          this.recalculando = false;
          this.refrescar();
        },
        error: (error) => {
          this.mensajeError = error?.error?.detail || 'No se pudo recalcular la clasificacion';
          this.recalculando = false;
        }
      });
  }

  movimientoClase(miembro: ClasificacionItem): string {
    if (miembro.movimiento > 0) {
      return 'success';
    }

    if (miembro.movimiento < 0) {
      return 'danger';
    }

    return 'muted';
  }

  movimientoTexto(miembro: ClasificacionItem): string {
    if (miembro.movimiento > 0) {
      return `+${miembro.movimiento}`;
    }

    if (miembro.movimiento < 0) {
      return `${miembro.movimiento}`;
    }

    return '-';
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase();
  }

  trackByMiembro(_: number, miembro: ClasificacionItem): number {
    return miembro.id_liga_miembro;
  }
}
