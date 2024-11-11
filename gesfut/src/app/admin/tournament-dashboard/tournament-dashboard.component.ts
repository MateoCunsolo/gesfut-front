import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT, INITIAL_TOURNAMENT_SHORT } from '../../core/services/tournament/initial-tournament';

@Component({
  selector: 'app-tournament-dashboard',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
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
  code: string = '';
  flag: boolean = false;
  constructor() { }
  
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
