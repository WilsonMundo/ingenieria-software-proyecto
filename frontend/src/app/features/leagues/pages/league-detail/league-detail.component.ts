import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LeaguesService } from '../../services/leagues.service';
import { League } from '../../interfaces/league.interface';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './league-detail.component.html',
  styleUrls: ['./league-detail.component.css']
})
export class LeagueDetailComponent implements OnInit {

  league!: League;

  activeTab: string = 'rankings';

  constructor(
    private route: ActivatedRoute,
    private leaguesService: LeaguesService
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadLeague(id);

  }

  loadLeague(id: number): void {

    this.leaguesService.getLeagueById(id)
      .subscribe({

        next: (response) => {
          this.league = response;
        },

        error: (error) => {
          console.error(error);
        }

      });

  }

}