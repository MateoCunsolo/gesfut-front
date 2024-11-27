import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchResponse, ParticipantResponse, PlayerParticipantResponse, TournamentResponseFull } from '../../core/models/tournamentResponse';
import { SessionService } from '../../core/services/manager/session.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { AdminService } from '../../core/services/manager/admin.service';
import { TeamService } from '../../core/services/tournament/team.service';
import { ParticipantShortResponse } from '../../core/models/participantShortResponse';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { INITIAL_PARTICIPANT, INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { AlertService } from '../../core/services/alert.service';
import { DashboardService } from '../../core/services/dashboard.service';
@Component({
  selector: 'app-list-team-tournaments',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './list-teams-tournaments.component.html',
  styleUrl: './list-teams-tournaments.component.scss'
})
export class ListTeamsTournamentsComponent {

  // Inyección de servicios
  private activedRoute = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private torunameService = inject(TournamentService);
  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private alertService = inject(AlertService);

  // nuevas variables
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  firstParticipant: ParticipantResponse = INITIAL_PARTICIPANT;
  teamsNameFilter: { name: string, idTeam: number }[] = [];
  code: string = '';
  isAuth: boolean = false;
  nameClicked: boolean = false;
  indexName: number = 0;
  searchTerm: string = '';
  teamNameClicked: string = '';
  teams: TeamResponse[] = [];
  constructor() { }

  ngOnInit(): void {
    if (this.sessionService.isAuth()) { this.isAuth = true; } else { this.isAuth = false; }
    if (this.activedRoute.snapshot.paramMap.get('code')) { this.code = this.activedRoute.snapshot.paramMap.get('code') || ''; }

    this.torunameService.currentTournament.subscribe({
      next: (response: TournamentResponseFull) => {
        this.tournament = response;
        this.tournament.participants = this.tournament.participants.filter(participant => participant.name.toLowerCase() !== 'free');
        this.tournament.participants.sort((a, b) => a.name.localeCompare(b.name));
        this.tournament.participants.forEach(participant => {
          participant.playerParticipants.sort((a, b) => a.shirtNumber - b.shirtNumber);
        });

        this.firstParticipant = this.tournament.participants[0];
        this.teamsNameFilter = this.tournament.participants.map(participant => ({
          name: participant.name,
          idTeam: participant.idTeam
        }));

        this.teamNameClicked = this.firstParticipant.name;
        this.nameClicked = true;
        this.indexName = this.teamsNameFilter.findIndex(team => team.name === this.teamNameClicked);
      }
    });
  }


  toLastMatchs() {
    this.alertService.loadingAlert('OBTENIENDO PARTIDOS DEL EQUIPO ' + this.teamNameClicked);
    let idParticipant = this.tournament.participants.find(participant => participant.name === this.teamNameClicked);
    if (!idParticipant) {
      return;
    } else {
      console.log(idParticipant);
      this.tournamentService.getMatchesAllForParticipant(this.tournament.code, idParticipant.idParticipant).subscribe({
        next: (response: MatchResponse[]) => {
          this.alertService.successAlert('PARTIDOS OBTENIDOS CON ÉXITO');
          sessionStorage.setItem('teamNameMatches', this.teamNameClicked);
          sessionStorage.setItem('matches', JSON.stringify(response));
          localStorage.removeItem('lastTournamentClickedName');
          localStorage.removeItem('lastTournamentClicked');
          this.dashboardService.setActiveTournamentComponent('lasts-matches');
        }
      });
    }
  }





  getParticipantsAllByIdTeam(id: number, indexName: number) {
    this.nameClicked = true;
    this.indexName = indexName;
    this.teamNameClicked = this.teamsNameFilter[indexName].name;
    this.firstParticipant = this.tournament.participants.find(participant => participant.idTeam === id) || INITIAL_PARTICIPANT;
  }


  filterTeams() {
    const term = this.searchTerm.toLowerCase();
    this.nameClicked = false;
    this.teamsNameFilter = this.tournament.participants
      .filter(participant => participant.name.toLowerCase().includes(term))
      .map(participant => ({
        name: participant.name,
        idTeam: participant.idTeam
      }))

    this.teamsNameFilter.forEach((team, index) => {
      if (team.name === this.teamNameClicked) {
        this.nameClicked = true;
        this.indexName = index;
      }
    });

  }

  deleteTeamFormTournament(idTeam: number) {
    let nameTeam = this.teamsNameFilter.find(team => team.idTeam === idTeam)?.name;
    if (nameTeam) {
      alert("¿Estás seguro de que quieres eliminar el equipo " + nameTeam + " del torneo?");
    }
    alert("El equipo con id " + idTeam + " ha sido eliminado del torneo \n FALTA IMPLEMENTACION.");
  }

  deletePlayerParticipantFromTeam(idPlayer: number) {

    if (this.validations(idPlayer)) {
      return;
    }

    let idPlayerParticipant = idPlayer;
    let nameParticipant = this.firstParticipant.playerParticipants.find(player => player.id === idPlayerParticipant)?.playerName;
    let lastNameParticipant = this.firstParticipant.playerParticipants.find(player => player.id === idPlayerParticipant)?.playerLastName;
    let nameTeam = this.teamsNameFilter[this.indexName].name;
    let nameTournament = this.tournament.name;

    if (nameTeam) {
      alert("¿Estás seguro de que quieres eliminar el jugador [ " + nameParticipant + lastNameParticipant + " ] del equipo [ " + nameTeam + " ] del torneo [ " + nameTournament + " ]?");
    }

    this.firstParticipant.playerParticipants = this.firstParticipant.playerParticipants.filter(player => player.id !== idPlayerParticipant);
    this.torunameService.changeStatusPlayer(this.code, idPlayerParticipant, false).subscribe({
      next: (response) => {
        console.log(response);
      }
    });
  }

  validations(idPlayer: number): boolean {
    let player = this.firstParticipant.playerParticipants.find(player => player.id === idPlayer);
    alert(player?.isCaptain);
    alert(player?.isGoalKeeper);
    if (player?.isCaptain) {
      alert("No puedes eliminar a un capitán");
      return true;
    }
    if (player?.isGoalKeeper) {
      alert("No puedes eliminar a un portero");
      return true;
    }
    return false;
  }

}

