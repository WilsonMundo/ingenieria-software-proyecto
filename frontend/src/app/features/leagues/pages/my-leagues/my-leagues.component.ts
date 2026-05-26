import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
    MatIconModule
  ],
  templateUrl: './my-leagues.component.html',
  styleUrls: ['./my-leagues.component.css']
})
export class MyLeaguesComponent implements OnInit {

  leagues: League[] = [];

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
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}