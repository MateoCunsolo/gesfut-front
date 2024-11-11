import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { NavbarComponent } from "../../admin/navbar/navbar.component";
import { TournamentDashboardComponent } from "../../admin/tournament-dashboard/tournament-dashboard.component";
import { InitializeTournamentComponent } from "../../admin/initialize-tournament/initialize-tournament.component";
import { ListMatchDaysComponent } from "../../admin/match-day/list-match-days/list-match-days.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ActivatedRoute } from '@angular/router';
import { MatchDaysComponent } from "../../admin/match-day/match-days/match-days.component";
import { ListTeamsComponent } from "../../admin/list-teams/list-teams.component";



@Component({
  selector: 'app-admin-tournament-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TournamentDashboardComponent, InitializeTournamentComponent, ListMatchDaysComponent, MatchDaysComponent, ListTeamsComponent],
  templateUrl: './admin-tournament-page.component.html',
  styleUrl: './admin-tournament-page.component.scss'
})
export class AdminTournamentPageComponent implements AfterViewInit {

  activeComponent = '';
  flag: boolean = false;
  code: string = '';
  isLoading: boolean = true;

  constructor(
    private dashboardService: DashboardService,
    private tournamentService: TournamentService,
    private activedRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    this.dashboardService.setNameTournament(localStorage.getItem('lastTournamentClickedName') || '');

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
      }
    });

    this.tournamentService.getTournamentFull(this.code).subscribe({
      next: (response) => {
        this.tournamentService.currentTournament.next(response);
      }
    });

    this.dashboardService.activeTournamentComponent$.subscribe((component: string) => {
      this.activeComponent = component;
    })
  }

  ngAfterViewInit() {
    this.dashboardService.activeTournamentComponent$.subscribe((component: string) => {
      this.activeComponent = component;
    })
  }

}

