import { Component } from '@angular/core';
import { TeamRequest } from '../../core/models/teamRequest';
import { NavbarComponent } from "../navbar/navbar.component";
import { AdminService } from '../../core/services/admin.service';
import { TeamResponse } from '../../core/models/teamResponse';

@Component({
  selector: 'app-initialize-tournament',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './initialize-tournament.component.html',
  styleUrl: './initialize-tournament.component.scss'
})
export class InitializeTournamentComponent {

  teams: TeamResponse[] = [];
  teamsTournament: TeamResponse[] = []; // en realidad es TouramenteParticipantRequest !!! cambiar y pensar 
  code :string = 'string';
  constructor(private adminService: AdminService) { }

  ngOnInit(): void {

    //extraer el codigo del torneo desde el url posiscion ante ultima
    this.code = window.location.pathname.split('/')[window.location.pathname.split('/').length - 2];
    this.teamsTournament = []; 
    this.teams = [];

    this.adminService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.slice(0, 8).sort((a, b) => a.name.localeCompare(b.name));
        console.log(this.teams);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('TEAMS LOADED');
      }
    });

  }

  initTournament() {
    let ids = [];
    for (let i = 0; i < this.teamsTournament.length; i++) {
      ids.push(this.teamsTournament[i].id);
    }


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
        console.log(err);
      },
      complete: () => {
        console.log('TOURNAMENT INITIALIZED');
        alert('Torneo inicializado -- redirigir a la pagina de torneos -- version 1');
      }
    });
  }


  addTeam(team: TeamResponse) {
    if(!this.teamsTournament.includes(team)){
      this.teamsTournament.push(team);
    }else{
      alert('El equipo ya esta en la lista del torneo');
    }
    this.teams = this.teams.filter(t => t !== team);
  }

  deleteTeam(team: TeamResponse) {
    this.teamsTournament = this.teamsTournament.filter(t => t !== team);
    this.teams.push(team);
    this.teams.sort((a, b) => a.name.localeCompare(b.name));
  }


  editTeam(team: TeamRequest) {
    throw new Error('Method not implemented.');
  }


}
