import { Component } from '@angular/core';
import { TeamRequest } from '../../core/models/teamRequest';
import { NavbarComponent } from "../navbar/navbar.component";
import { AdminService } from '../../core/services/manager/admin.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-initialize-tournament',
    imports: [FormsModule],
    templateUrl: './initialize-tournament.component.html',
    styleUrl: './initialize-tournament.component.scss'
})
export class InitializeTournamentComponent {
  teams: TeamResponse[] = [];
  teamsTournament: TeamResponse[] = [];
  teamsFilters: TeamResponse[] = [];
  code: string = '';
  searchTerm: string = '';


  constructor(
    private adminService: AdminService,
    private route: Router,
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private tournamentService: TournamentService,
    private alertService: AlertService
  ) { }



  changeComponent(component: string) {
    this.dashboardService.setActiveTournamentComponent(component);
  }

  addNewTeamToTournament() {
    this.changeComponent('create-team');
  }


  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe({
      next: (param) => {
        if (param.get('code')) {
          this.code = param.get('code')!;
        }
      }
    });

    this.adminService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.map(team => ({
          ...team,
          name: team.name.toUpperCase()
        })).sort((a, b) => a.name.localeCompare(b.name));
        this.teams = this.teams.filter(team => team.status === true);
        this.teamsFilters = [...this.teams];

      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        console.log('TEAMS LOADED');
      }
    });
  }

  filterTeams() {
    this.teams = this.teamsFilters.filter(team =>
      team.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }



  initTournament() {
    this.alertService.loadingAlert('Inicializando torneo...');
    if (this.teamsTournament.length >= 4) {
      const ids = this.teamsTournament.map(team => team.id);
      const initializeRequest = {
        tournamentCode: this.code,
        teams: ids
      };
      this.adminService.initTournament(initializeRequest).subscribe({
        next: (response) => {
          this.alertService.successAlert('Torneo inicializado');
          setTimeout(() => {
            window.location.reload();
          }, 1500);

        },
        error: (err) => {
          this.alertService.errorAlert(err.error.error);
          console.error(err);
        },
        complete: () => {
          console.log('TOURNAMENT INITIALIZED');
        }
      });
    } else {
      this.alertService.errorAlert('El torneo debe tener al menos 4 equipos');
    }
  }

  addTeam(team: TeamResponse) {
    if (!this.teamsTournament.includes(team)) {
      this.teamsTournament.push(team);
      this.teams = this.teams.filter(t => t !== team);
      this.teamsFilters = this.teamsFilters.filter(t => t !== team);
    } else {
      alert('El equipo ya está en la lista del torneo');
    }
  }

  deleteTeam(team: TeamResponse) {
    this.teamsTournament = this.teamsTournament.filter(t => t !== team);
    this.teamsFilters.push(team);
    this.teams.push(team);
    this.teams.sort((a, b) => a.name.localeCompare(b.name));
  }

  editTeam(team: TeamRequest) {
    throw new Error('Method not implemented.');
  }

  toBack() {
    alert("¿Está seguro de que desea salir? Se perderán los cambios realizados");
    this.route.navigate(['/admin/tournaments/' + this.code]);
  }
}