import { Component } from '@angular/core';
import { TeamRequest } from '../../core/models/teamRequest';
import { NavbarComponent } from "../navbar/navbar.component";
import { AdminService } from '../../core/services/admin.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-initialize-tournament',
  standalone: true,
  imports: [NavbarComponent, FormsModule],
  templateUrl: './initialize-tournament.component.html',
  styleUrl: './initialize-tournament.component.scss'
})
export class InitializeTournamentComponent {
  teams: TeamResponse[] = [];
  teamsTournament: TeamResponse[] = [];
  teamsFilters: TeamResponse[] = [];
  code: string = '';
  searchTerm: string = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.code = window.location.pathname.split('/')[window.location.pathname.split('/').length - 2];

    this.adminService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.sort((a, b) => a.name.localeCompare(b.name));
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

    if (this.teamsTournament.length > 4) {
      const ids = this.teamsTournament.map(team => team.id);
      const initializeRequest = {
        tournamentCode: this.code,
        teams: ids
      };

      console.log(initializeRequest);

      this.adminService.initTournament(initializeRequest).subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          console.log('TOURNAMENT INITIALIZED');
          alert('Torneo inicializado -- redirigir a la página de torneos -- versión 1');
        }
      });
    }else{
      alert("INGRESE EQUIPOS POR FAVOR { MIN : 4 }")
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
}
