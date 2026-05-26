import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { League } from '../../interfaces/league.interface';

import { LeaguesService } from '../../services/leagues.service';

import { MatIconModule } from '@angular/material/icon';

import { MatDialog } from '@angular/material/dialog';

import { PredictionModalComponent }
from '../../components/prediction-modal/prediction-modal.component';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './league-detail.component.html',
  styleUrls: ['./league-detail.component.css']
})
export class LeagueDetailComponent implements OnInit {

  league!: League;
  activeTab: string = 'matches';
  matches: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private leaguesService: LeaguesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );
    this.loadLeague(id);
    this.loadMatches();
  }

  loadLeague(id: number): void {
    this.leaguesService
      .getLeagueById(id)
      .subscribe({
        next: (response) => {
          this.league = response;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  loadMatches(): void {
    this.leaguesService
      .getMatches()
      .subscribe({
        next: (response) => {
          this.matches = response;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  openPredictionModal(match: any): void {
    const dialogRef = this.dialog.open(
      PredictionModalComponent,
      {
        width: '850px',
        data: {
          ...match,
          id_liga: this.league.id_liga
        }
      }
    );
    dialogRef.afterClosed()
      .subscribe((result) => {
        if (!result) return;
        alert('Vaticinio guardado');
      });
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

}