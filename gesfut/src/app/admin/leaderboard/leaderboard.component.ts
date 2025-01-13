import { Component } from '@angular/core';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.currentTournament.subscribe({
      next: (response: TournamentResponseFull) => {
        this.tournament = response;
        this.tournament.participants = this.tournament.participants.filter(
          (participant) => participant.name.toLowerCase() !== 'free'
        );
        this.tournament.participants.sort(
          (a, b) => b.statistics.points - a.statistics.points
        );
        console.log(this.tournament.participants)
      },
      error: (error => {
        console.log(error);
      })
    });
  }
}
