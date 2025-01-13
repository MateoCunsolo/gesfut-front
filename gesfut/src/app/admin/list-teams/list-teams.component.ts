import { Component, inject, input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchResponse, ParticipantResponse, PlayerParticipantResponse } from '../../core/models/tournamentResponse';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../core/services/manager/session.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { AdminService } from '../../core/services/manager/admin.service';
import { TeamService } from '../../core/services/tournament/team.service';
import { ParticipantShortResponse } from '../../core/models/participantShortResponse';
import { NgClass } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { Router } from '@angular/router';
import { AddPlayerComponent } from "../add-player/add-player.component";

@Component({
  selector: 'app-list-teams',
  standalone: true,
  templateUrl: './list-teams.component.html',
  styleUrls: ['./list-teams.component.scss'],
  imports: [FormsModule, NgClass, AddPlayerComponent]
})

export class ListTeamsComponent {

  // Inyección de servicios
  private activedRoute = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private adminService = inject(AdminService);
  private teamService = inject(TeamService);
  private dashboardService = inject(DashboardService);
  private alertService = inject(AlertService);
  private tournamentService = inject(TournamentService);
  private router = inject(Router);

  // Autenticación del usuario
  isAuth: boolean = false;
  loadInfo: boolean = false;
  lastsMatches: boolean = false;
  // Filtro de búsqueda
  teamsFilters: TeamResponse[] = [];
  searchTerm: string = '';
  addPlayerClicked: Boolean = false;
  // Equipos
  teamsGlobal: TeamResponse[] = [];
  selectedTeam: TeamResponse = {
    id: 0,
    name: '',
    color: '',
    status: true,
    players: []
  }
  selectedTournamentIndex: number | null = null;
  isOptionGlobal: boolean = false;
  // Participantes
  particpantsShortAll: ParticipantShortResponse[] = [];
  playersParticipants: PlayerParticipantResponse[] = [];

  // Estado de interacción
  clicked: boolean = false;
  nameClicked: boolean = true;
  indexName: number = 0;
  indexTeamClicked: number = 0;
  listTeamsAll: boolean = false;

  constructor() { }

  ngOnInit(): void {
    if (!this.activedRoute.snapshot.paramMap.get('code') && this.sessionService.isAuth()) {
      this.fetchTeamsGlobal();
      this.isAuth = true;
    }
  }

  handleParticipantRefresh($event: ParticipantResponse) {
    if (this.selectedTournamentIndex !== null) {
      this.particpantsShortAll[this.selectedTournamentIndex].playerParticipants = $event.playerParticipants;
      this.showPlayersParticipants(this.particpantsShortAll[this.selectedTournamentIndex].playerParticipants, this.selectedTournamentIndex);
      this.addPlayerClicked = false;
    }
  }

  formHandler($event: Boolean) {
    this.addPlayerClicked = $event
  }

  showAlertTeamGlobal() {
    this.alertService.infoAlert('Añadir jugador a equipo global', 'No veras los cambios en los torneos actuales, sino en los proximos torneos que agregues este equipo.');
    this.alertService.confirmAlert('AÑADIR UN JUGADOR A ' + this.selectedTeam.name, 'Veras al jugador en los proximos torneos que se inscriba este equipo.', 'Añadir').then((result) => {
      if (result.isConfirmed) {
        this.addPlayerClicked = true;
        this.isOptionGlobal = true;
      } else {
        this.addPlayerClicked = false;
      }
    });
  }

  showAlertTournament() {
    if (this.selectedTournamentIndex == null) {
      this.alertService.errorAlert('Selecciona un torneo para añadir un jugador');
    } else {
      let title = 'AÑADIR UN JUGADOR A ' + this.particpantsShortAll[this.selectedTournamentIndex].nameTournament;
      this.alertService.confirmAlert(title, 'Solamente lo agrega al equipo en este torneo especifico. ', 'Añadir').then((result) => {
        if (result.isConfirmed && this.selectedTournamentIndex !== null) {
          this.addPlayerClicked = true;
          this.isOptionGlobal = false;
        }
        else {
          this.addPlayerClicked = false;
        }
      });
    }
  }


  addPlayer() {
    this.alertService.twoOptionsAlert(
      '¿Dónde quieres añadir el jugador?',
      'Selecciona una opción',
      'Equipo Global',
      'Torneo Actual'
    ).then((result) => {
      if (result.isConfirmed) {
        this.showAlertTeamGlobal();
      } else if (result.dismiss?.toLocaleString() === 'cancel') {
        this.showAlertTournament();
      } else{
        return;
      }
    });
  }

  toLastMatchs() {
    if (this.selectedTournamentIndex == null) {
      this.alertService.errorAlert('Selecciona un torneo para ver sus partidos');
    } else {
      this.alertService.loadingAlert('OBTENIENDO PARTIDOS DEL TORNEO ' + this.particpantsShortAll[this.selectedTournamentIndex].nameTournament + "...");
      this.tournamentService.getMatchesAllForParticipant(this.particpantsShortAll[this.indexName].codeTournament, this.particpantsShortAll[this.indexName].idParticipant).subscribe({
        next: (response: MatchResponse[]) => {
          this.alertService.successAlert('PARTIDOS OBTENIDOS CON ÉXITO');
          sessionStorage.setItem('teamNameMatches', this.selectedTeam.name);
          sessionStorage.setItem('matches', JSON.stringify(response));

          if (this.selectedTournamentIndex !== null) {
            localStorage.setItem('lastTournamentClickedName', this.particpantsShortAll[this.selectedTournamentIndex].nameTournament);
            localStorage.setItem('lastTournamentClicked', this.particpantsShortAll[this.selectedTournamentIndex].codeTournament);
            this.router.navigate(['/admin/tournaments/' + this.particpantsShortAll[this.indexName].codeTournament]);
            this.dashboardService.setActiveTournamentComponent('lasts-matches');
          } else {
            this.alertService.errorAlert('Selecciona un torneo para ver sus partidos');
          }

        }
      });
    }
  }

  changeList() {
    this.alertService.infoAlertTop(this.listTeamsAll ? 'Equipos Activos' : 'Equipos Eliminados');
    this.listTeamsAll = !this.listTeamsAll;
    if (this.listTeamsAll) {
      const teamFound = this.teamsGlobal.find(team => team.status === false);
      if (teamFound) {
        this.teamsFilters = [...this.teamsGlobal];
        this.selectedTeam = teamFound;
        this.selectedTournamentIndex = this.teamsGlobal.indexOf(teamFound);
        this.getParticipantsAllByIdTeam(teamFound.id, this.selectedTournamentIndex);
      }
    } else {
      this.fetchTeamsGlobal();
    }
  }

  fetchTeamsGlobal(): void {
    this.adminService.getTeams().subscribe({
      next: (response: TeamResponse[]) => {
        response.forEach(team => { team.name = team.name.toUpperCase(); });
        this.teamsGlobal = response;
        const teamFound = this.teamsGlobal.find(team => team.status);
        if (teamFound) {
          this.teamsFilters = [...this.teamsGlobal];
          this.selectedTeam = teamFound;
          console.log(teamFound.players);
          this.selectedTournamentIndex = this.teamsGlobal.indexOf(teamFound);
          this.getParticipantsAllByIdTeam(teamFound.id, this.selectedTournamentIndex);
        }
      }
    });
  }

  getParticipantsAllByIdTeam(id: number, indexName: number) {
    this.loadInfo = false;
    this.indexTeamClicked = indexName;
    this.nameClicked = true;
    this.indexName = indexName;
    this.teamService.getParticipantsShortAllTournamemts(id).subscribe({
      next: (response: ParticipantShortResponse[]) => {
        console.log(response);
        this.loadInfo = true;
        this.particpantsShortAll = response;
        this.selectedTeam = this.teamsGlobal.find(team => team.id === id) || this.selectedTeam;
        if (this.particpantsShortAll.length > 0) {
          this.isAuth = true;
          this.showPlayersParticipants(this.particpantsShortAll[0].playerParticipants, 0);
        } else {
          this.isAuth = false;
          this.clicked = false;
          this.selectedTournamentIndex = null;
          this.playersParticipants = [];
          this.teamsGlobal.forEach(team => {
            if (team.id === id) {
              team.players.forEach(player => {
                this.playersParticipants.push({
                  id: 0,
                  shirtNumber: player.number,
                  playerName: player.name,
                  playerLastName: player.lastName,
                  goals: 0,
                  redCards: 0,
                  yellowCards: 0,
                  isSuspended: false,
                  isMvp: 0,
                  matchesPlayed: 0,
                  status: true,
                  isActive: true,
                  isCaptain: player.isCaptain,
                  isGoalKeeper: player.isGoalKeeper
                })
              })
            }
          });
        }
      }
    });

  }

  changeComponent(component: string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }


  showPlayersParticipants(playerParticipantsAux: PlayerParticipantResponse[], index: number) {
    this.teamsGlobal.forEach(team => {
      team.players.forEach(player => {
        playerParticipantsAux.forEach(playerParticipant => {
          if (player.name === playerParticipant.playerName && player.lastName === playerParticipant.playerLastName) {
            playerParticipant.shirtNumber = player.number;
            playerParticipant.isGoalKeeper = player.isGoalKeeper;
            playerParticipant.isCaptain = player.isCaptain;
          }
        });
      });
    });
    this.clicked = true;
    this.selectedTournamentIndex = index;
    this.playersParticipants = playerParticipantsAux.map(player => ({
      ...player,
      playerName: player.playerName,
      playerLastName: player.playerLastName
    }));
    this.playersParticipants.sort((a, b) => a.shirtNumber - b.shirtNumber);
  }


  filterTeams() {
    this.teamsGlobal = this.teamsFilters.filter(team =>
      team.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.teamsGlobal.forEach((team, index) => {
      if (team.name === this.selectedTeam.name) {
        this.nameClicked = true;
        this.indexName = index;
      }
    });

  }

  deletePlayerFromTeamGlobal(firstName: string, lastName: string): void {
    //ENCONTRAR JUGADOR EN TEAMGLOBAL
    let yes = prompt('¿Estás seguro de que quieres eliminar a ' + firstName + ' ' + lastName + ' de ' + this.teamsGlobal[this.indexName].name + '? \n Sera eliminado de todos los torneos. \n Escribe "SI" para confirmar.');
    if (yes === null || yes === '' || yes === undefined || yes.toLowerCase() == 'no') {
      return;
    }
    let player = this.teamsGlobal[this.indexName].players.find(player => player.name === firstName && player.lastName === lastName);
    if (player?.isCaptain) {
      alert('No se puede eliminar al capitán');
      return;
    } else if (player?.isGoalKeeper) {
      alert('No se puede eliminar al portero');
      return
    }
    //ELIMINAR JUGADOR DE TEAMGLOBAL
    this.teamsGlobal[this.indexName].players = this.teamsGlobal[this.indexName].players.filter(player => player.name !== firstName && player.lastName !== lastName);
    //ELIMINAR JUGADOR DE PARTICIPANTSSHORTAL DE TODOS LOS TORNEOS
    if (this.selectedTournamentIndex !== null) {
      this.particpantsShortAll.forEach(participant => {
        participant.playerParticipants = participant.playerParticipants.filter(player => player.playerName !== firstName && player.playerLastName !== lastName);
      });
    }
    //ELIMINAR JUGADOR DE PLAYERSPARTICIPANTS
    this.playersParticipants = this.playersParticipants.filter(player => player.playerName !== firstName && player.playerLastName !== lastName);
    //ELIMINAR JUGADOR DE BASE DE DATOS
    if (player) {
      this.teamService.changeStatusPlayerGlobal(player.id, false).subscribe({
        next: () => {
          console.log('(', player.number, ')', firstName, lastName, 'ELIMINADO');
          //LANZAR NOTIFICACIÓN.... :) 
        }
      });
    } else {
      console.error('Player not found');
    }
  }


  deleteTeamGlobal() {
    let idTeam = this.teamsGlobal[this.indexName].id;
    let yes = prompt('¿Estás seguro de que quieres eliminar a ' + this.teamsGlobal[this.indexName].name + '? \n Se eliminará de todos los torneos. \n Escribe "SI" para confirmar.');

    if (yes === null || yes === '' || yes === undefined || yes.toLowerCase() == 'no') {
      return;
    }

    // Llamada al servicio para cambiar el estado del equipo
    this.teamService.changeStatusTeam(idTeam, false).subscribe(
      (response) => {
        console.log('Estado del equipo cambiado:', response);

        // Si la respuesta es exitosa, eliminamos el equipo de la lista
        this.teamsGlobal = this.teamsGlobal.filter(team => team.id !== idTeam);
        this.particpantsShortAll = [];
        this.playersParticipants = [];
        this.selectedTeam.name = '';
        this.selectedTeam.status = true;
        this.selectedTeam.id = 0;
        this.selectedTeam.players = [];
        this.selectedTeam.color = '';
        this.selectedTournamentIndex = null;
        let findTeam = this.teamsGlobal.find(team => team.status);
        if (findTeam) {
          this.getParticipantsAllByIdTeam(findTeam.id, this.teamsGlobal.indexOf(findTeam));
        }
      },
      (error) => {
        console.error('Error al cambiar el estado del equipo:', error);
      }
    );
  }


  showStatisticsAllTournaments() {
    this.clicked = false
    this.selectedTournamentIndex = null;
    let playerParticipantsAux: PlayerParticipantResponse[] = [];
    console.log(this.particpantsShortAll);
    this.particpantsShortAll.forEach(participant => {
      participant.playerParticipants.forEach(player => {
        let playerFound = playerParticipantsAux.find(playerAux => playerAux.playerName === player.playerName && playerAux.playerLastName === player.playerLastName);
        if (playerFound) {
          playerFound.goals += player.goals;
          playerFound.yellowCards += player.yellowCards;
          playerFound.redCards += player.redCards;
          playerFound.matchesPlayed += player.matchesPlayed;
          playerFound.isMvp += player.isMvp;
          playerFound.isGoalKeeper = this.playersParticipants.find(playerParticipant => player.playerName === playerParticipant.playerName && player.playerLastName === playerParticipant.playerLastName)?.isGoalKeeper || false;
          playerFound.isCaptain = this.playersParticipants.find(playerParticipant => player.playerName === playerParticipant.playerName && player.playerLastName === playerParticipant.playerLastName)?.isCaptain || false;
          playerFound.shirtNumber = player.shirtNumber;

        } else {
          playerParticipantsAux.push({ ...player });
        }
        this.playersParticipants = playerParticipantsAux.sort((a, b) => a.shirtNumber - b.shirtNumber);
      });
    });
    console.log(playerParticipantsAux);
  }


}
