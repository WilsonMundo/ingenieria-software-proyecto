import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PartidoService } from '../../../../../services/partido.service';
import { FaseService } from '../../../../../services/fase.service';
import { Partido } from '../../../../../models/dto/partido.dto';
import { Fase } from '../../../../../models/dto/fase.dto';

interface PartidosPorFase { fase: Fase; partidos: Partido[]; }

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './bracket-componente.html',
  styleUrl: './bracket-componente.css',
})
export class BracketComponente implements OnInit {
  partidos: Partido[] = [];
  fases: Fase[] = [];
  partidosPorFase: PartidosPorFase[] = [];
  cargando = false;

  constructor(private partidoService: PartidoService, private faseService: FaseService) {}

  ngOnInit(): void {
    this.cargando = true;
    this.faseService.getAll().subscribe((fases) => {
      this.fases = fases.sort((a, b) => a.orden_fase - b.orden_fase);
      this.partidoService.getAll().subscribe((partidos) => {
        this.partidos = partidos;
        this.partidosPorFase = this.fases.map((fase) => ({
          fase,
          partidos: partidos.filter((p) => p.id_fase === fase.id_fase),
        }));
        this.cargando = false;
      });
    });
  }

  getResultado(p: Partido): string {
    return p.estado_partido === 'finalizado' ? 'Finalizado' : p.estado_partido === 'en_juego' ? ' En Juego' : ' Pendiente';
  }
}
