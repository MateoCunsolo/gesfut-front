import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from './leaderboard.service';
import { TopScorerResponse } from '../../core/models/topScorersResponse';
import { TopYellowCardResponse } from '../../core/models/topYellowCardsResponse';
import { TopRedCardsResponse } from '../../core/models/topRedCardsResponse';
import { forkJoin, Subscription } from 'rxjs';
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
  expandedTeam = 0;
  idChampionOfPlayoffs: number = 0;
  idChampionOfTournament: number = 0;
  code: string = '';
  private readonly destroyRef = inject(DestroyRef);
  private statsSubscription?: Subscription;

  constructor(private alertService: AlertService, private tournamentService: TournamentService, private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
    // Usa el torneo ya cargado (y cacheado) por la página: no vuelve a pedirlo al servidor.
    // Se mantiene suscripto para reflejar cambios tras guardar resultados o generar playoffs.
    this.tournamentService.currentTournament.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.code = response.code;
        this.tournament = structuredClone(response);
        this.noContainerMatchDayPlayoffs();
        if (this.code) this.loadStatistics();
      }
    });
  }

  loadStatistics() {
    const code = this.tournament.code;
    this.statsSubscription?.unsubscribe();
    this.statsSubscription = forkJoin({
      scorers: this.leaderboardService.getTopScorers(code),
      yellow: this.leaderboardService.getYellowCard(code),
      red: this.leaderboardService.getTopRedCards(code)
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ scorers, yellow, red }) => {
        this.topScorers = scorers.filter((topScorer: TopScorerResponse) => topScorer.goals > 0);
        this.topYellowCards = yellow.filter((topYellow: TopYellowCardResponse) => topYellow.yellowCards > 0);
        this.topRedCards = red.filter((topRed: TopRedCardsResponse) => topRed.redCards > 0);
      }
    });
  }


  findTeam(teamName: string) {
    return this.tournament.participants.find((team) => team.name === teamName)?.idParticipant || 0;
  }

  noContainerMatchDayPlayoffs() {
    // El backend devuelve clasificación de liga y campeones oficiales por etapa.
    this.idChampionOfTournament = this.tournament.championOfLeagueId ?? 0;
    this.idChampionOfPlayoffs = this.tournament.championOfPlayoffsId ?? 0;
  }

  showTeamDetails(idTeam: number) {
    if (idTeam == this.idChampionOfPlayoffs) {
      this.alertService.infoAlert('CAMPEON DEL PLAYOFF', '' + this.tournament.participants.find((team) => team.idParticipant == this.idChampionOfPlayoffs)?.name);
    } else if (idTeam == this.idChampionOfTournament) {
      this.alertService.infoAlert('CAMPEON DEL TORNEO', '' + this.tournament.participants.find((team) => team.idParticipant == this.idChampionOfTournament)?.name);
    }
  }

}
