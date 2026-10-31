import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuestService } from './../../core/services/guest/guest.service';
import { TournamentNavComponent } from '../../shared/tournament-nav/tournament-nav.component';
import { Component, HostListener, DestroyRef, inject } from '@angular/core';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription, defer } from 'rxjs';
import { LoadErrorKind, loadErrorKind, retryTransient } from '../../core/utils/load-retry';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import {
  INITIAL_TOURNAMENT,
  INITIAL_TOURNAMENT_SHORT,
} from '../../core/services/tournament/initial-tournament';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { environment } from '../../../enviroments/environment';
import { HttpClient } from '@angular/common/http';
import { ListMatchDaysComponent } from '../../admin/match-day/list-match-days/list-match-days.component';
import { LeaderboardComponent } from "../../admin/leaderboard/leaderboard.component";
import { NavbarComponent } from "../../admin/navbar/navbar.component";
import { PrizeDashboardComponent } from "../../admin/prizes/prize-dashboard/prize-dashboard.component";
import { RecapComponent } from "../../guest/recap/recap.component";
import { ListTeamsTournamentsComponent } from "../../admin/list-team-tournaments/list-teams-tournaments.component";
import { LastsMatchesComponent } from "../../admin/lasts-matches/lasts-matches.component";
import { DashboardService } from '../../core/services/dashboard.service';


@Component({
    selector: 'app-public-page',
    imports: [TournamentNavComponent, ListMatchDaysComponent, LeaderboardComponent, ListTeamsTournamentsComponent, LastsMatchesComponent, PrizeDashboardComponent, RecapComponent],
    templateUrl: './public-page.component.html',
    styleUrl: './public-page.component.scss'
})
export class PublicPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  currentTournament: BehaviorSubject<TournamentResponseFull> =
    new BehaviorSubject<TournamentResponseFull>(INITIAL_TOURNAMENT);
  currentListTournaments: BehaviorSubject<TournamentResponseShort[]> =
    new BehaviorSubject<TournamentResponseShort[]>([]);
  currentTournamentShort: BehaviorSubject<TournamentResponseShort> =
    new BehaviorSubject<TournamentResponseShort>(INITIAL_TOURNAMENT_SHORT);
  currentActiveComponent: string = '';
  url = environment.apiUrl;
  code: string = '';

  isMobile: boolean = false;
  menuOpen: boolean = false;
  loadError = false;
  loadErrorKind: LoadErrorKind = 'offline';
  private loadSubscription?: Subscription;
  loadingTournament = true;
  tournamentName: string = 'Cargando nombre...';
  /** Revisión crítica #13: torneo archivado (visible, solo lectura). */
  archived = false;
  constructor(
    private tournamentService: TournamentService,
    private activedRoute: ActivatedRoute,
    private guestService: GuestService,
    private dashboardService: DashboardService
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {
     
    this.dashboardService.getNameTournament$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: string) => {
        this.tournamentName = response;
      }
    });

    this.activedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const code = paramMap.get('code');
      if (code) {
        this.code = code;
        this.loadTournament();
      }
    });

    this.guestService.activeComponent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.currentActiveComponent = response;
      },
    });
  }


  loadTournament(forceRefresh = false): void {
    this.loadingTournament = true;
    this.loadError = false;
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = defer(() => this.tournamentService.getTournamentFull(this.code, forceRefresh)).pipe(
      retryTransient(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: TournamentResponseFull) => {
        this.currentTournament.next(response);
        this.archived = response.isActive === false;
        this.dashboardService.setNameTournament(response.name);
        this.loadingTournament = false;
      },
      error: (error: unknown) => {
        this.loadingTournament = false;
        this.loadError = true;
        this.loadErrorKind = loadErrorKind(error);
        this.tournamentName = 'Torneo';
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  changeComponent(component: string) {
    this.guestService.setActiveComponent(component);
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
