import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
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

@Component({
  selector: 'app-admin-tournament-page',
  standalone: true,
  imports: [CommonModule, AddPlayerComponent, NavbarComponent,CreateTeamComponent, ListTeamsTournamentsComponent, TournamentDashboardComponent, InitializeTournamentComponent, ListMatchDaysComponent, LoadResultComponent, LastsMatchesComponent, LeaderboardComponent,PrizeDashboardComponent],
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

