import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { League } from '../../interfaces/league.interface';

@Component({
  selector: 'app-league-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './league-card.component.html',
  styleUrls: ['./league-card.component.css']
})
export class LeagueCardComponent {

  @Input({ required: true })
  league!: League;

}