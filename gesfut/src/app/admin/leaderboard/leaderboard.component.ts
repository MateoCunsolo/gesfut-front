import { Component } from '@angular/core';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from './leaderboard.service';
import { TopScorerResponse } from '../../core/models/topScorersResponse';
import { TopYellowCardResponse } from '../../core/models/topYellowCardsResponse';
import { TopRedCardsResponse } from '../../core/models/topRedCardsResponse';
import { find, last } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  topScorers: TopScorerResponse[] = [];
  topYellowCards: TopYellowCardResponse[] = [];
  topRedCards: TopRedCardsResponse[] = [];
  idChampionOfPlayoffs: number = 0;
  idChampionOfTournament: number = 0;
  code: string = '';

  constructor(private alertService: AlertService, private tournamentService: TournamentService, private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
  this.tournamentService.currentTournament.subscribe({
    next: (response) => {
      this.code = response.code;
      this.tournamentService.getTournamentFull(this.code).subscribe({
        next: (response: TournamentResponseFull) => {
          this.tournament = response;
          this.noContainerMatchDayPlayoffs();
          this.loadStatistics();
        }
      });
    }
  }).unsubscribe();

    

  }

  loadStatistics() {
    this.leaderboardService.getTopScorers(this.tournament.code).subscribe({
      next: (response: TopScorerResponse[]) => {
        this.topScorers = response.filter((topScorer) => topScorer.goals > 0);
      }
    })
    this.leaderboardService.getYellowCard(this.tournament.code).subscribe({
      next: (response: TopYellowCardResponse[]) => {
        this.topYellowCards = response.filter((topYellow) => topYellow.yellowCards > 0)
      }
    })
    this.leaderboardService.getTopRedCards(this.tournament.code).subscribe({
      next: (response: TopRedCardsResponse[]) => {
        this.topRedCards = response.filter((topRed) => topRed.redCards > 0)
      }
    })
  }


  findTeam(teamName: string) {
    return this.tournament.participants.find((team) => team.name === teamName)?.idParticipant || 0;
  }

  noContainerMatchDayPlayoffs() {
    const lastMatchDay = this.tournament.matchDays[this.tournament.matchDays.length - 1];
    if (lastMatchDay.isPlayOff && lastMatchDay.matches.length <= 1) {
      this.idChampionOfPlayoffs = lastMatchDay.matches[0].homeGoals > lastMatchDay.matches[0].awayGoals ? this.findTeam(lastMatchDay.matches[0].homeTeam) : this.findTeam(lastMatchDay.matches[0].awayTeam);
      this.tournament.participants.forEach((team) => {
        if (team.idParticipant == this.idChampionOfPlayoffs) {
          console.log("El campeon de los playoffs: " + team.name);
        }
      })
    }

    this.tournament.matchDays.forEach((matchDay) => {
      if (matchDay.isPlayOff) {
        matchDay.matches.forEach((match) => {
          this.tournament.participants.forEach((team) => {
            if (team.name === match.homeTeam || team.name === match.awayTeam) {
              // Determinar si es local o visitante
              const isHomeTeam = team.name === match.homeTeam;
              const goalsFor = isHomeTeam ? match.homeGoals : match.awayGoals;
              const goalsAgainst = isHomeTeam ? match.awayGoals : match.homeGoals;

              // Determinar cómo se dieron los puntos
              let pointsToRemove = 0;
              if (match.homeGoals > match.awayGoals) {
                pointsToRemove = isHomeTeam ? 3 : 0; // Si es local y ganó, pierde 3 puntos
              } else if (match.homeGoals < match.awayGoals) {
                pointsToRemove = isHomeTeam ? 0 : 3; // Si es visitante y ganó, pierde 3 puntos
              } else {
                pointsToRemove = 1; // Si empataron, pierden 1 punto cada uno
              }

              // Restar estadísticas evitando valores negativos
              team.statistics.points = Math.max(0, team.statistics.points - pointsToRemove);
              team.statistics.goalsFor = Math.max(0, team.statistics.goalsFor - goalsFor);
              team.statistics.goalsAgainst = Math.max(0, team.statistics.goalsAgainst - goalsAgainst);

              if (match.homeGoals > match.awayGoals) {
                // Solo restar si realmente ganó o perdió
                if (isHomeTeam) {
                  team.statistics.wins = Math.max(0, team.statistics.wins - 1);
                } else {
                  team.statistics.losses = Math.max(0, team.statistics.losses - 1);
                }
              } else if (match.homeGoals < match.awayGoals) {
                if (isHomeTeam) {
                  team.statistics.losses = Math.max(0, team.statistics.losses - 1);
                } else {
                  team.statistics.wins = Math.max(0, team.statistics.wins - 1);
                }
              } else {
                team.statistics.draws = Math.max(0, team.statistics.draws - 1);
              }

              team.statistics.matchesPlayed = Math.max(0, team.statistics.matchesPlayed - 1);
            }
          });
        });
      }
    });



    this.tournament.participants.sort((a, b) => {
      if (a.statistics.points === b.statistics.points) {
        if (a.statistics.goalsFor - a.statistics.goalsAgainst === b.statistics.goalsFor - b.statistics.goalsAgainst) {
          return b.statistics.goalsFor - a.statistics.goalsFor;
        }
        return b.statistics.goalsFor - b.statistics.goalsAgainst - a.statistics.goalsFor - a.statistics.goalsAgainst;
      }
      return b.statistics.points - a.statistics.points;
    });

    this.idChampionOfTournament = this.tournament.participants[0].idParticipant;
    console.log("El campeon del torneo es: " + this.tournament.participants[0].name);
  }


  showTeamDetails(idTeam: number) {
    if (idTeam == this.idChampionOfPlayoffs) {
      this.alertService.infoAlert('CAMPEON DEL PLAYOFF', '' + this.tournament.participants.find((team) => team.idParticipant == this.idChampionOfPlayoffs)?.name);
    } else if (idTeam == this.idChampionOfTournament) {
      this.alertService.infoAlert('CAMPEON DEL TORNEO', '' + this.tournament.participants.find((team) => team.idParticipant == this.idChampionOfTournament)?.name);
    }
  }

}
