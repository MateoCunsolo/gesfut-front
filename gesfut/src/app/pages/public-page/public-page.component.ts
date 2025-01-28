import { GuestService } from './../../core/services/guest/guest.service';
import { Component, HostListener } from '@angular/core';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [ListMatchDaysComponent, LeaderboardComponent, PrizeDashboardComponent, RecapComponent],
  templateUrl: './public-page.component.html',
  styleUrl: './public-page.component.scss',
})
export class PublicPageComponent {
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

  constructor(
    private tournamentService: TournamentService,
    private activedRoute: ActivatedRoute,
    private guestService: GuestService
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {

    this.activedRoute.paramMap.subscribe((paramMap) => {
      const code = paramMap.get('code');
      if (code) {
        this.code = code;
      }
    });

    this.tournamentService.getTournamentFull(this.code).subscribe({
      next: (response: TournamentResponseFull) => {
        this.currentTournament.next(response);
      },
    });

    this.guestService.activeComponent$.subscribe({
      next: (response) => {
        this.currentActiveComponent = response;
      },
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
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  /* activeComponent = '';
  flag: boolean = false;
  code: string = '';
  isLoading: boolean = true;

  constructor(
    private dashboardService: DashboardService,
    private tournamentService: TournamentService,
    private activedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.dashboardService.setNameTournament(
      localStorage.getItem('lastTournamentClickedName') || ''
    );

    this.activedRoute.paramMap.subscribe((paramMap) => {
      const code = paramMap.get('code');
      if (code) {
        this.code = code;
      }
    });

    this.tournamentService.getTournamentShort(this.code).subscribe({
      next: (response) => {
        this.flag = response.haveParticipants;
        this.dashboardService.setHaveParticipants(response.haveParticipants);
        this.isLoading = false;
      },
    });

    this.tournamentService.getTournamentFull(this.code).subscribe({
      next: (response) => {
        this.tournamentService.currentTournament.next(response);
      },
    });

    this.dashboardService.activeTournamentComponent$.subscribe(
      (component: string) => {
        this.activeComponent = component;
      }
    );

    this.dashboardService.setActiveTournamentComponent('list-teams-tournament')
  }

  ngAfterViewInit() {
    this.dashboardService.activeTournamentComponent$.subscribe(
      (component: string) => {
        this.activeComponent = component;
      }
    );
  } */
}
