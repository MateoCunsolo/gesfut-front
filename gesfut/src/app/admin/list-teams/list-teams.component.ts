import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/manager/admin.service';
import { ParticipantResponse, TournamentResponseFull } from '../../core/models/tournamentResponse';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ParticipantResponseShort } from '../../core/models/participantResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';

@Component({
  selector: 'app-list-teams',
  standalone: true,
  templateUrl: './list-teams.component.html',
  styleUrls: ['./list-teams.component.scss'],
  imports: [NavbarComponent, FormsModule]
})
export class ListTeamsComponent {

  private tournamentService = inject(TournamentService);
  private activedRoute = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  isAuth: boolean = false;
  tournamentFull: TournamentResponseFull = INITIAL_TOURNAMENT;
  size: number [] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  selectedTeamIndex: number | null = null;
  selectedTeam: ParticipantResponse | null = null;
  searchTerm: string = '';
  teamsFilters: ParticipantResponseShort[] = [];
  teamsList: ParticipantResponseShort[] = [];
  code: string = '';

  constructor() {}

  ngOnInit(): void {

    if (this.sessionService.isAuth()) {
      this.isAuth = true;
    }

    
    this.code = this.activedRoute.snapshot.paramMap.get('code') || '';
    this.tournamentService.currentTournament.subscribe({
      next: (response: TournamentResponseFull) => {
        this.tournamentFull = response;
        console.log(this.tournamentFull);
        this.teamsList = response.participants.filter(p => p.name.toLowerCase() !== 'free').sort((a, b) => a.name.localeCompare(b.name));        
        this.teamsFilters = [...this.teamsList];
        if (this.teamsList.length > 0) {
          this.getTeamByID(this.teamsList[0].idParticipant);
        }
      }
    });
  }

  filterTeams() {
    this.teamsList = this.teamsFilters.filter(team =>
      team.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getTeamByID(id: number): void {
    const team = this.tournamentFull.participants.find(p => p.idParticipant === id);
    this.selectedTeam = team ? team : null;
  }


  deletePlayer(idPlayer: number, idTeam?: number): void {

  }
  

}
