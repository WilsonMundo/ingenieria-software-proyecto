import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { League } from '../../interfaces/league.interface';
import { LeaguesService } from '../../services/leagues.service';

import { MatIconModule } from '@angular/material/icon';

import { LeagueCardComponent } from '../../components/league-card/league-card.component';

@Component({
  selector: 'app-my-leagues',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LeagueCardComponent,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './my-leagues.component.html',
  styleUrls: ['./my-leagues.component.css']
})
export class MyLeaguesComponent implements OnInit {
  leagues: League[] = [];
  filteredLeagues: League[] = [];
  activeFilter: string = 'todas';
  searchQuery: string = '';
  constructor(
    private leaguesService: LeaguesService
  ) {}

  ngOnInit(): void {
    this.loadLeagues();
  }

  loadLeagues(): void {
    this.leaguesService.getLeagues().subscribe({
      next: (response) => {
        this.leagues = response;
        this.filteredLeagues = response;
      },

      error: (error) => {
        console.error(error);
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.leagues];
    // Buscador
    if (this.searchQuery.trim()) {
      filtered = filtered.filter((league) =>
        league.nombre
          ?.toLowerCase()
          .includes(this.searchQuery.toLowerCase())
      );
    }

    // Filtros
    switch (this.activeFilter) {
      case 'apuesta':
        filtered = filtered.filter(
          (league) =>
            league.tipo_liga?.toLowerCase() === 'apuesta'
        );
        break;

      case 'diversion':
        filtered = filtered.filter(
          (league) =>
            league.tipo_liga?.toLowerCase() === 'diversion'
        );
        break;

      case 'activas':
        filtered = filtered.filter(
          (league) =>
            league.estado?.toLowerCase() === 'activa'
        );
        break;

      case 'finalizadas':
        filtered = filtered.filter(
          (league) =>
            league.estado?.toLowerCase() === 'finalizada'
        );
        break;
    }
    this.filteredLeagues = filtered;
  }
}