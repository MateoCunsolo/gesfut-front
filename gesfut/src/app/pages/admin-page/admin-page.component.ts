import { ListTournamentsComponent } from '../../admin/list-tournaments/list-tournaments.component';
import { Component, inject } from '@angular/core';
import { DashboardComponent } from "../../admin/dashboard/dashboard.component";
import { CreateTournamentComponent } from "../../admin/create-tournament/create-tournament.component";
import { CreateTeamComponent } from "../../admin/create-team/create-team.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { TeamService } from '../../core/services/tournament/team.service';
import { AdminService } from '../../core/services/manager/admin.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { NamesTeamsComponent } from '../../admin/list-teams/names-teams.component';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [DashboardComponent, NamesTeamsComponent, CreateTournamentComponent, CreateTeamComponent, ListTournamentsComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {


  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);
  private adminService = inject(AdminService);
  listTournaments: TournamentResponseShort[] = [];
  activeComponent = 'dashboard';
  teamsGlobal: TeamResponse[] = [];
  id: number = 0;
  constructor() { }

  ngOnInit() {

    this.tournamentService.getTournamentShortList().subscribe({
      next: (response) => {
        this.listTournaments = response;
      }
    });

    this.dashboardService.activeDashboardAdminComponent$.subscribe((component: string) => {
      this.activeComponent = component;
    });


    
  }

}

