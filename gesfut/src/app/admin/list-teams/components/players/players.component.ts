import { Component, ElementRef, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatchResponse, ParticipantResponse, PlayerParticipantResponse } from '../../../../core/models/tournamentResponse';
import { INITIAL_PARTICIPANT } from '../../../../core/services/tournament/initial-tournament';
import { TournamentService } from '../../../../core/services/tournament/tournament.service';
import { DeleteComponent } from './delete/delete.component';
import { TeamService } from '../../../../core/services/tournament/team.service';
import { TeamResponse } from '../../../../core/models/teamResponse';
import { AddPlayerComponent } from "./add-player/add-player.component";
import { TeamWithAllStatsPlayerResponse } from '../../../../core/models/TeamWithAllStatsPlayerResponse';
import { AlertService } from '../../../../core/services/alert.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { GuestService } from '../../../../core/services/guest/guest.service';

@Component({
    selector: 'app-players',
    imports: [DeleteComponent, AddPlayerComponent],
    templateUrl: './players.component.html',
    styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnChanges {

  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);
  private alertService = inject(AlertService);
  private dashboardService = inject(DashboardService);
  private guestService = inject(GuestService);
  private route = inject(Router);
  @Input() public participantId: number | null = null;
  @Input() public idTeam: number | null = null;
  @Input() public thereAreNotParticipants: boolean = false;
  @Input() public isGlobalTeam: boolean = false;
  @Input() public code: string = '';
  @Input() public nameTournament: string = '';
  protected isGlobalTeamPlayers: boolean = false;
  protected participantTeam: ParticipantResponse = INITIAL_PARTICIPANT;
  protected participantGlobalStats = {} as TeamWithAllStatsPlayerResponse;
  protected flagAddPlayer: boolean = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['participantId'] || changes['isGlobalTeam'] || changes['idTeam']) && this.participantId !== null) {
      if (this.isGlobalTeam) {
        console.log('Obteniendo jugadores globales');
        if (this.idTeam) { this.getPlayersGlobal(this.idTeam); } else { console.error('No se ha proporcionado el id del equipo'); }
      } else {
        this.getPlayersParticipants(this.participantId);
      }
    }

    if (changes['code']) {
      this.code = changes['code'].currentValue;
    }

    if (changes['isGlobalTeam']) {
      this.isGlobalTeamPlayers = this.isGlobalTeam;
    }

    if (changes['nameTournament']) {
      this.nameTournament = changes['nameTournament'].currentValue;
    }

  }

  getPlayersGlobal(idTeam: number) {
    this.teamService.getTeam(idTeam).subscribe({
      next: (response) => {
        if (response) {
          console.log('Equipo global obtenido:', response);
          this.mapPlayersGlobal(response);
        }
      },
      error: (error) => {
        console.error('Error al obtener los jugadores globales:', error);
      }
    });
  }

  getPlayersParticipants(idParticipant: number) {
    this.tournamentService.getTournamentParticipantTeamByID(idParticipant).subscribe({
      next: (response) => {
        if(!this.isGlobalTeam){
          this.participantTeam = response;
        }
      },
      error: (error) => {
        console.error('Error al obtener los jugadores del equipo participante', error);
      }
    });
  }


  deletePlayer(idPlayerGlobal: number) {
    if (this.isGlobalTeam) {
      this.participantGlobalStats.playerParticipants = this.participantGlobalStats.playerParticipants.filter(player => player.playerId !== idPlayerGlobal);
      console.log('Jugadores globales eliminados:', this.participantGlobalStats);
    } else {
      this.participantTeam.playerParticipants = this.participantTeam.playerParticipants.filter(player => player.playerId !== idPlayerGlobal);
    }
  }

  returnIfIsGlobalOrNot() {
    if (this.isGlobalTeam) {
      return this.participantGlobalStats.idTeam;
    } else {
      return this.participantTeam.idTeam;
    }
  }

  areThereParticipanForThisTeam() {
    if (this.isGlobalTeam) {
      return 0;
    } else {
      return this.participantTeam.idParticipant;
    }
}


  mapPlayersGlobal(response: TeamResponse) {
    this.teamService.getAllStatsPlayersFromTeam(response.id).subscribe({
      next: (response) => {
        if (response) {
          this.participantGlobalStats = response;
        }
        console.log('Jugadores globales mapeados:', this.participantGlobalStats);
        console.log('es global team:', this.isGlobalTeam);
      },
      error: (error) => {
        console.error('Error al obtener las estadísticas de los jugadores del equipo', error);
      }


    });
  }


  showFormAddPlayer() {
    this.flagAddPlayer = true;
  }

  cancelAddPlayerEvent() {
    this.flagAddPlayer = false;
  }

  addPlayerToTeam(newPlayer: PlayerParticipantResponse) {
    console.log('Agregando jugador:', newPlayer);
    if (this.isGlobalTeam) {
      //antes de agregar
      console.log('Jugadores globales antes de agregar:', this.participantGlobalStats);
      this.participantGlobalStats.playerParticipants.push(newPlayer);
      console.log('Jugadores globales después de agregar:', this.participantGlobalStats);
    } else {
      this.participantTeam.playerParticipants.push(newPlayer);
    }
  }

  deleteTeam() {
    this.alertService.infoAlert("ELMINAR EQUIPO", "FUNCION NO IMPLEMENTADA");
  }

  toLastMatches() {
    if(this.isGlobalTeam){
      this.alertService.errorAlert('Debes selecionar un torneo para ver los partidos.');
    }else if (this.participantId){
      this.alertService.loadingAlert('OBTENIENDO ULTIMOS PARTIDOS');
      console.log('Obteniendo ultimos partidos: ', this.participantTeam.idParticipant);
      console.log('Obteniendo ultimos partidos: ', this.code);
        this.tournamentService.getMatchesAllForParticipant(this.code, this.participantTeam.idParticipant).subscribe({
          next: (response: MatchResponse[]) => {
            console.log('Ultimos partidos:', response);
            this.tournamentService.setMatches(response);
            this.tournamentService.setNameTeamToViewEvents(this.participantTeam.name);
            this.dashboardService.setActiveDashboardAdminComponent('lasts-matches');
            sessionStorage.setItem('lastTournamentClickedName', this.nameTournament);
            this.alertService.closeLoadingAlert();
          }
        });
      }else{
        this.alertService.errorAlert('No se ha seleccionado un equipo');
      }
    }
  
}
   