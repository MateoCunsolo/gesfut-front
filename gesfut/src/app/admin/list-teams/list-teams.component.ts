import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/manager/admin.service';
import { ParticipantResponse, PlayerParticipantResponse, TournamentResponseFull } from '../../core/models/tournamentResponse';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ParticipantResponseShort } from '../../core/models/participantResponse';
import { getTestBed } from '@angular/core/testing';

@Component({
  selector: 'app-list-teams',
  standalone: true,
  templateUrl: './list-teams.component.html',
  styleUrls: ['./list-teams.component.scss'],
  imports: [NavbarComponent,FormsModule]
})
export class ListTeamsComponent {
  
  private tournamentService = inject(TournamentService);
  private adminService = inject(AdminService);
  private activedRoute = inject(ActivatedRoute)
  
  participants: ParticipantResponse = {
    idParticipant: 0,
    idTeam: 0,
    name: '',
    isActive: false,
    playerParticipants: [],
    statistics: {
        points: 0,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
    }
  }

  selectedTeamIndex: number | null = null;
  selectedTeam: ParticipantResponse | null = null; 
  searchTerm: string = '';
  teamsFilters: ParticipantResponseShort[] = [];
  teamsList: ParticipantResponseShort [] = [];
  code: string = '';

  constructor() {}

  ngOnInit(): void {

    this.code = this.activedRoute.snapshot.paramMap.get('code') || '';


    this.tournamentService.getTournamentsParticipantTeamsShort(this.code).subscribe((response) => {
        this.teamsList = response;
        this.teamsFilters = response;
        this.getTeamByID(this.teamsList[0].idParticipant);
      });

    

  }
  
  filterTeams() {
    this.teamsList = this.teamsFilters.filter(team =>
      team.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    
  }

  getTeamByID(id: number): void {
    console.log(id);
    this.tournamentService.getTournamentParticipantTeamByID(id).subscribe({
      next: (response: ParticipantResponse) => {
        this.selectedTeam = response;
      }
    });
  }


}
