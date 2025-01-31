import { AdminService } from '../../core/services/manager/admin.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Component, inject } from '@angular/core';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT, INITIAL_TOURNAMENT_SHORT } from '../../core/services/tournament/initial-tournament';

@Component({
    selector: 'app-tournament-dashboard',
    imports: [RouterModule],
    templateUrl: './tournament-dashboard.component.html',
    styleUrl: './tournament-dashboard.component.scss'
})

export class TournamentDashboardComponent {

  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private activatedRoute = inject(ActivatedRoute);

  tournamentFull: TournamentResponseFull = INITIAL_TOURNAMENT;
  tournamentShort: TournamentResponseShort = INITIAL_TOURNAMENT_SHORT;
  isLoading: boolean = true;

  constructor() { }
  
  code: string = '';
  flag: boolean = false;

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe({
      next: (param) => {
        if (param.get('code')) {
          this.code = param.get('code')!;
        }
      }
    });

    this.dashboardService.haveParticipants$.subscribe({
      next: (response: boolean) => {
        this.flag = response;
        if (this.flag) {
          this.isLoading = false;
        }
      }
    });

    if (this.code) {
      this.tournamentService.currentTournament.subscribe({
        next: (response: TournamentResponseFull) => {
          this.tournamentFull = response;
          this.isLoading = false;
        }}
      );
    }

  }

  changeComponent(component: string) {
    this.dashboardService.setActiveTournamentComponent(component);
  }

  toInitializeTournament() {
    alert('toInitializeTournament');
  }
}
