import { Component } from '@angular/core';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from './leaderboard.service';
import { TopScorerResponse } from '../../core/models/topScorersResponse';
import { TopYellowCardResponse } from '../../core/models/topYellowCardsResponse';
import { TopRedCardsResponse } from '../../core/models/topRedCardsResponse';

@Component({
    selector: 'app-leaderboard',
    imports: [CommonModule],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  topScorers: TopScorerResponse [] = [];
  topYellowCards: TopYellowCardResponse [] = [];
  topRedCards: TopRedCardsResponse [] = [];

  constructor(private tournamentService: TournamentService, private leaderboardService:LeaderboardService) {}

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
        this.loadStatistics();
        console.log(this.tournament.participants)
      },
      error: (error => {
        console.log(error);
      })
    });


  }

  loadStatistics(){
    this.leaderboardService.getTopScorers(this.tournament.code).subscribe({
      next: (response:TopScorerResponse[]) => {
        this.topScorers = response.filter((topScorer)=>topScorer.goals>0);
        console.log(this.topScorers);
      }
    })
    this.leaderboardService.getYellowCard(this.tournament.code).subscribe({
      next: (response:TopYellowCardResponse[]) => {
        this.topYellowCards = response.filter((topYellow)=>topYellow.yellowCards>0)
        console.log(this.topYellowCards);
      }
    })
    this.leaderboardService.getTopRedCards(this.tournament.code).subscribe({
      next: (response:TopRedCardsResponse[]) => {
        this.topRedCards = response.filter((topRed)=>topRed.redCards>0)
        console.log(this.topRedCards);
      }
    })
  }
}
