import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { League } from '../../interfaces/league.interface';

import { LeaguesService } from '../../services/leagues.service';

import { MatIconModule } from '@angular/material/icon';

import { MatDialog } from '@angular/material/dialog';

import { PredictionModalComponent } from '../../components/prediction-modal/prediction-modal.component';

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
  predictions: any[] = [];
  isAdmin: boolean = false;
  isMember: boolean = false;
  joinRequests: any[] = [];

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
    this.loadMatches(id);
    this.loadPredictions(id);
  }

  loadLeague(id: number): void {
    this.leaguesService
      .getLeagueById(id)
      .subscribe({
        next: (response) => {
          this.league = response;
          this.isAdmin =
            response.rol_liga === 'admin';
          this.isMember =
            !!response.rol_liga;
          if (this.isAdmin) {
            this.loadJoinRequests();
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  loadMatches(idLiga: number): void {
    this.leaguesService
      .getMatches()
      .subscribe({
        next: (response) => {
          this.matches = response.map((match: any) => {
            const prediction = this.predictions.find(
              (p) =>
                p.id_partido === match.id_partido
            );
            return {
              ...match,
              prediction
            };
          });
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  loadPredictions(idLiga: number): void {
    this.leaguesService
      .getPredictions(idLiga)
      .subscribe({
        next: (response) => {
          this.predictions = response;
          this.matches = this.matches.map(
            (match: any) => {
              const prediction =
                this.predictions.find(
                  (p) =>
                    p.id_partido === match.id_partido
                );
              return {
                ...match,
                prediction
              };
            }
          );
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  loadJoinRequests(): void {
    if (!this.league) {
      return;
    }
    this.leaguesService
      .getJoinRequests(this.league.id_liga)
      .subscribe({
        next: (response) => {
          this.joinRequests = response;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  requestJoinLeague(): void {
    if (!this.league) {
      return;
    }
    this.leaguesService
      .createJoinRequest(this.league.id_liga)
      .subscribe({
        next: () => {
          alert(
            'Solicitud enviada correctamente'
          );
        },
        error: (error) => {
          console.error(error);
          alert(
            error.error.detail
          );
        }
      });
  }

  resolveRequest(
    idSolicitud: number,
    estado: string
  ): void {
    this.leaguesService
      .resolveJoinRequest(
        idSolicitud,
        estado
      )
      .subscribe({
        next: () => {
          this.loadJoinRequests();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  openPredictionModal(match: any): void {
    this.dialog.open(
      PredictionModalComponent,
      {
        width: '850px',
        data: {
          ...match,
          id_liga: this.league.id_liga,
          prediction: match.prediction
        }
      }
    )
    .afterClosed()
    .subscribe((result) => {
      if (!result) {
        return;
      }
      this.loadPredictions(
        this.league.id_liga
      );
    });
  }
  changeTab(tab: string): void {
    this.activeTab = tab;
  }

}