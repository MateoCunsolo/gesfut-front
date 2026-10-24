import { rememberIfMine } from '../../core/utils/last-tournament';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, defer, EMPTY, forkJoin, Subject, switchMap, tap } from 'rxjs';
import { LoadErrorKind, loadErrorKind, retryTransient } from '../../core/utils/load-retry';
import { NavbarComponent } from "../../admin/navbar/navbar.component";
import { TournamentDashboardComponent } from "../../admin/tournament-dashboard/tournament-dashboard.component";
import { InitializeTournamentComponent } from "../../admin/initialize-tournament/initialize-tournament.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ActivatedRoute } from '@angular/router';
import { ListMatchDaysComponent } from "../../admin/match-day/list-match-days/list-match-days.component";
import { LoadResultComponent } from "../../admin/match-day/load-result/load-result.component";
import { ListTeamsTournamentsComponent } from "../../admin/list-team-tournaments/list-teams-tournaments.component";
import { LastsMatchesComponent } from "../../admin/lasts-matches/lasts-matches.component";
import { LeaderboardComponent } from "../../admin/leaderboard/leaderboard.component";
import { CreateTeamComponent } from '../../admin/create-team/create-team.component';
import { AddPlayerComponent } from '../../admin/list-teams/components/players/add-player/add-player.component';
import { PrizeDashboardComponent } from "../../admin/prizes/prize-dashboard/prize-dashboard.component";
import { NamesTeamsComponent } from '../../admin/list-teams/names-teams.component';
import { RecapComponent } from '../../guest/recap/recap.component';

@Component({
  selector: 'app-admin-tournament-page',
  imports: [CommonModule, AddPlayerComponent, NavbarComponent, CreateTeamComponent, RecapComponent, ListTeamsTournamentsComponent, TournamentDashboardComponent, InitializeTournamentComponent, ListMatchDaysComponent, LoadResultComponent, LastsMatchesComponent, LeaderboardComponent, PrizeDashboardComponent],
  templateUrl: './admin-tournament-page.component.html',
  styleUrl: './admin-tournament-page.component.scss'
})
export class AdminTournamentPageComponent  {
  @ViewChild(LoadResultComponent) resultEditor?: LoadResultComponent;

  canLeave(): boolean | Promise<boolean> {
    return this.resultEditor?.canLeave() ?? true;
  }

  activeComponent = '';
  flag: boolean = false;
  code: string = '';
  isLoading: boolean = true;

  constructor(
    private dashboardService: DashboardService,
    private tournamentService: TournamentService,
    private activedRoute: ActivatedRoute
  ) { }

  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<string>();
  loadError = false;
  loadErrorKind: LoadErrorKind = 'offline';
  private forceRefresh = false;

  ngOnInit() {
    this.dashboardService.activeTournamentComponent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(component => this.activeComponent = component);
    this.dashboardService.haveParticipants$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.flag = value);

    this.reload.pipe(
      tap(code => {
        this.code = code;
        this.isLoading = true;
        this.loadError = false;
        this.dashboardService.setNameTournament('');
      }),
      switchMap(code => defer(() => forkJoin({
        short: this.tournamentService.getTournamentShort(code),
        full: this.tournamentService.getTournamentFull(code, this.forceRefresh)
      })).pipe(retryTransient(), catchError((error: unknown) => {
        this.loadError = true;
        this.loadErrorKind = loadErrorKind(error);
        this.isLoading = false;
        return EMPTY;
      }))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({short, full}) => {
      this.dashboardService.setNameTournament(full.name);
      // Se guarda al abrir el torneo (cualquier camino) solo si el servidor confirma que es mio y no esta archivado.
      const opened = this.code;
      this.tournamentService.isMyTournament(opened).subscribe({ next: (mine) => rememberIfMine(opened, !!mine, (full as any).isActive), error: () => {} });
      this.dashboardService.setHaveParticipants(short.haveParticipants);
      this.dashboardService.setActiveTournamentComponent(short.haveParticipants ? 'recap' : 'dashboard');
      this.isLoading = false;
    });

    this.activedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const code = params.get('code');
      if (code) this.reload.next(code);
    });
  }

  retryLoad() {
    this.forceRefresh = true;
    this.reload.next(this.code);
    this.forceRefresh = false;
  }
}
