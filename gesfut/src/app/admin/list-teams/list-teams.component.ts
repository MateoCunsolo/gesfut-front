import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/manager/admin.service';
import { ParticipantResponse, TournamentResponseFull } from '../../core/models/tournamentResponse';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ParticipantResponseShort } from '../../core/models/participantResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';

@Component({
  selector: 'app-list-teams',
  standalone: true,
  templateUrl: './list-teams.component.html',
  styleUrls: ['./list-teams.component.scss'],
  imports: [NavbarComponent, FormsModule]
})
export class ListTeamsComponent {

  private tournamentService = inject(TournamentService);
  private adminService = inject(AdminService);
  private activedRoute = inject(ActivatedRoute);

  tournamentFull: TournamentResponseFull = INITIAL_TOURNAMENT;

  selectedTeamIndex: number | null = null;
  selectedTeam: ParticipantResponse | null = null;
  searchTerm: string = '';
  teamsFilters: ParticipantResponseShort[] = [];
  teamsList: ParticipantResponseShort[] = [];
  code: string = '';

  constructor() {}

  ngOnInit(): void {
    this.code = this.activedRoute.snapshot.paramMap.get('code') || '';

    this.tournamentService.currentTournament.subscribe({
      next: (response: TournamentResponseFull) => {
        this.tournamentFull = response;
        this.teamsList = response.participants; 
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
}
