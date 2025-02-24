import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert.service';
import { TeamService } from '../../../../../core/services/tournament/team.service';
import { TournamentService } from '../../../../../core/services/tournament/tournament.service';
import { PlayerRequest } from '../../../../../core/models/teamRequest';
import { ParticipantResponse, PlayerParticipantResponse } from '../../../../../core/models/tournamentResponse';
import { PlayerResponse } from '../../../../../core/models/teamResponse';
import { forkJoin, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { INITIAL_PARTICIPANT } from '../../../../../core/services/tournament/initial-tournament';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-add-player',
  imports: [ReactiveFormsModule, FormsModule, NgClass],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss'],
  inputs: ['teamName', 'teamPlayers']
})
export class AddPlayerComponent implements OnChanges {

  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private teamService = inject(TeamService);
  private tournamentService = inject(TournamentService);
  private route = inject(Router);
  @Input() teamIdParticipant: number = 0;
  @Input() teamIdGlobal: number = 0;
  @Input() codeTournament: string = '';
  @Input() playerDeleted: { idPlayer: number, idPlayerParticipant: number } = { idPlayer: 0, idPlayerParticipant: 0 };
  @Output() public addPlayerToTeam = new EventEmitter<PlayerParticipantResponse>();
  @Output() public cancelAddPlayerEvent = new EventEmitter<void>();

  protected teamParticipant: ParticipantResponse = INITIAL_PARTICIPANT;
  protected playersGlobal: PlayerResponse[] = [];
  protected selectedPlayerId: number = 0;
  protected therArePlayersToADD: boolean = false;
  protected inactivedPlayers: PlayerResponse[] = [];
  disbalechecks:boolean=false;
  playerForm: FormGroup;
  changeText: boolean = false;

  constructor() {
    this.playerForm = this.fb.group({
      teamId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      number: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
      isCaptain: [false],
      isGoalKeeper: [false],
    });
  }

  
  async callPlayerGlobals() {
    try {

      const teamResponse = await this.teamService.getTeam(this.teamIdGlobal).toPromise();
      if (!teamResponse || teamResponse.players.length === 0) {
        this.therArePlayersToADD = false;
        return;
      }
      
      if (this.teamIdParticipant === 0) {
        
        this.playersGlobal = teamResponse.players.filter(player => !player.status);
        this.therArePlayersToADD = this.playersGlobal.length > 0;
      }else{
        this.tournamentService.getTournamentParticipantTeamByID(this.teamIdParticipant).subscribe({
          next: (response) => {
            this.teamParticipant = response || { playerParticipants: [] };
    
            // Extraer los IDs de los jugadores que ya están en el torneo
            const existingPlayerIds = new Set(this.teamParticipant.playerParticipants.map(player => player.playerId));
    
            // Filtrar jugadores que NO están en el torneo
            const newPlayers = teamResponse.players.filter(player => !existingPlayerIds.has(player.id));
    
            // Filtrar jugadores que están en el torneo pero tienen isActive === false
            this.inactivedPlayers = this.teamParticipant.playerParticipants
              .filter(player => !player.isActive)
              .map(player => ({
                id: player.id, // ID del jugador en el torneo para poder encontrarlo y activarlo
                name: player.playerName,
                lastName: player.playerLastName,
                number: player.shirtNumber,
                isCaptain: player.isCaptain,
                isGoalKeeper: player.isGoalKeeper,
                status: player.status
              }));
    
            this.playersGlobal = [...newPlayers, ...this.inactivedPlayers];
            this.therArePlayersToADD = this.playersGlobal.length > 0;
    
            console.log('Jugadores globales:', this.playersGlobal);
          },
          error: (error) => {
            console.error('Error al obtener participante del equipo:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error al obtener jugadores globales:', error);
    }
  }
  
  
  

  changePlayer(event: Event) {
    this.changeText=false;
    const selectedPlayerId = Number((event.target as HTMLSelectElement).value);
    this.selectedPlayerId = selectedPlayerId;
    const player = this.playersGlobal.find(player => player.id === selectedPlayerId);

    if(this.teamParticipant.playerParticipants.find(player => player.id === selectedPlayerId)?.isActive===false){
      this.changeText=true;
    }

    if(this.playersGlobal.find(player => player.id === selectedPlayerId) && this.teamIdParticipant === 0){
      this.changeText=true;
    }
    this.playerForm.get('name')?.disable();
    this.playerForm.get('lastName')?.disable();
    this.playerForm.get('number')?.disable();
    this.playerForm.get('isCaptain')?.disable();
    this.playerForm.get('isGoalKeeper')?.disable();
    this.disbalechecks=true;
    if (player) {
      this.playerForm.get('name')?.setValue(player.name);
      this.playerForm.get('lastName')?.setValue(player.lastName);
      this.playerForm.get('number')?.setValue(player.number);
      this.playerForm.get('isCaptain')?.setValue(player.isCaptain);
      this.playerForm.get('isGoalKeeper')?.setValue(player.isGoalKeeper);
    }
  }

  resetSelect() {
    this.selectedPlayerId = 0;
    this.disbalechecks=false;
    this.changeText=false;
    this.clearValues();
  }

  clearValues() {
    this.playerForm.reset({
      teamId: this.teamIdParticipant,
      isCaptain: false,
      isGoalKeeper: false
    });
    this.playerForm.get('name')?.enable();
    this.playerForm.get('lastName')?.enable();  
    this.playerForm.get('number')?.enable();
    this.playerForm.get('isCaptain')?.enable();
    this.playerForm.get('isGoalKeeper')?.enable();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if(changes['playerDeleted']){
      console.log('Jugador eliminado:', this.playerDeleted);
      this.callPlayerGlobals();
    }else{
      console.log('No se ha eliminado ningún jugador: ACA');
    }

    if (changes['teamIdParticipant'] || changes['teamIdGlobal']) {
      this.disbalechecks=false;
      this.playersGlobal = [];
      this.inactivedPlayers = [];
      this.selectedPlayerId = 0;
      this.clearValues();
      this.playerForm.get('teamId')?.setValue(this.teamIdParticipant);
      this.callPlayerGlobals();
      this.verifyIfAreThereParticipantsForThisTeam();
    } else {
      console.log('No hay cambios');
    }
  }

  verifyIfAreThereParticipantsForThisTeam() {
    if (this.teamIdParticipant === 0) {
      console.log('No hay participaciones en torneos de este equipo');
    } else {
      console.log('teamIdParticipant:', this.teamIdParticipant);
    }
  }

  showErrors() {
    if (this.playerForm.get('name')?.invalid) {
      this.alertService.errorAlert('Falta ingresar el nombre.');
    } else if (this.playerForm.get('lastName')?.invalid) {
      this.alertService.errorAlert('Falta ingresar el apellido.');
    } else if (this.playerForm.get('number')?.invalid) {
      this.alertService.errorAlert('Falta ingresar el número de camiseta.');
    }
  }

  changeActivePlayer(id: number) {
    this.alertService.confirmAlert('Activar jugador', 'Este jugador ya está registrado en el torneo, ¿Deseas activarlo?', 'Aceptar').then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.changeStatusPlayerParticipant(id, true).subscribe({
          next: (response) => {
            this.alertService.successAlert('Jugador activado');
            this.playersGlobal = this.playersGlobal.filter(player => player.id !== id);
            this.inactivedPlayers = this.inactivedPlayers.filter(player => player.id !== id);
            this.therArePlayersToADD = this.playersGlobal.length > 0;
            const playerParticipant = this.teamParticipant.playerParticipants.find(player => player.id == id);
            if (playerParticipant) {
              playerParticipant.isActive = true;
              this.addPlayerToTeam.emit(playerParticipant);
              this.clearValues();
              this.selectedPlayerId = 0;
              this.disbalechecks=false;
              this.changeText=false;
            }else{
              console.error('No se encontró el jugador a activar');
            }
          },
          error: (error) => {
            console.error('Error al activar jugador:', error);
            this.alertService.errorAlert(error.error.error);
          }
        });
      }
    });
  }


  changeGlobalPlayerStatus() {
    this.teamService.changeStatusPlayerGlobal(this.selectedPlayerId, true).subscribe({
      next: (response) => {
        const player = this.playersGlobal.find(player => player.id === this.selectedPlayerId);
        if (!player) {
          console.error('No se encontró el jugador a activar');
          return;
        }  
        const playerMapped = this.mapPlayerNoParticipants(player);
        playerMapped.status = true;
        playerMapped.isActive = false;
        this.addPlayerToTeam.emit(playerMapped);
        this.playersGlobal = this.playersGlobal.filter(player => player.id !== this.selectedPlayerId);
        this.therArePlayersToADD = this.playersGlobal.length > 0;
        this.clearValues();
        this.selectedPlayerId = 0;
        this.disbalechecks=false;
        this.changeText=false;
        this.alertService.successAlert('Jugador activado');
      },
      error: (error) => {
        console.error('Error al activar jugador:', error);
        this.alertService.errorAlert(error.error.error);
      }
    });
  }


  addPlayer() {

    if(this.teamIdParticipant === 0 && this.changeText===true){
      this.changeGlobalPlayerStatus();
      return;
    }


    let flag = false;
    const numberShirt = this.playerForm.get('number')?.value;
    this.inactivedPlayers.some(player => {
      if (player.number === numberShirt) {
        this.changeActivePlayer(player.id);
        flag = true;
      }
    });

    if (flag) {
      console.log('Jugador activado');
      return;
    }

    if (this.playerForm.invalid) {
      this.showErrors();
      return;
    }

    if (this.teamIdParticipant != 0 && this.selectedPlayerId == 0) {
      if (this.route.url.includes('tournaments')) {
        this.showReConfirmAlert(1);
      } else {
        this.showMenuTwoOptions();
      }
    }
    else if (this.selectedPlayerId != 0) {
      this.showReConfirmAlert(1);
    } else {
      this.showReConfirmAlert(0);
    }
   
    this.disbalechecks=false;
  }

  showMenuTwoOptions() {
    this.alertService.twoOptionsAlert('Agregar jugador', 'Elije de donde quieres agregar al jugador', 'Equipo Global', 'Torneo Actual').then((result) => {
      if (result.isConfirmed) {
        this.showReConfirmAlert(0);
      } else {
        this.showReConfirmAlert(1);
      }
    });
  }

  addPlayerToGlobal(newPlayer: PlayerRequest) {
    this.teamService.addPlayerToTeam(this.teamIdGlobal, newPlayer).subscribe({
      next: (response) => {
        this.alertService.successAlert('Jugador agregado');
        this.clearValues();
        this.selectedPlayerId = 0;
        let playerMaped = this.mapPlayerNoParticipants(response);
        console.log('Jugador mapeado:', playerMaped);
        this.addPlayerToTeam.emit(playerMaped);
        if(this.teamIdParticipant != 0){
          this.playersGlobal.push(response);
        }
        this.playersGlobal = this.playersGlobal.filter(player => player.number !== playerMaped.shirtNumber);
        console.log('Jugadores globales filtrados:', this.playersGlobal);
        if (this.playersGlobal.length === 0) {
          this.therArePlayersToADD = false;
        }
      },
      error: (error) => {
        console.error('Error al agregar jugador:', error);
        this.alertService.errorAlert(error.error.error);
      }
    })
  }

  addPlayerToTournament(newPlayer: PlayerRequest) {
    this.tournamentService.addPlayerToParticipant(this.codeTournament, this.teamIdParticipant, newPlayer).subscribe({
      next: (response) => {
        this.alertService.successAlert('Jugador agregado');
        this.clearValues();
        this.selectedPlayerId = 0;
        if (response) {
          response.playerParticipants.forEach(playerParticipant => {
            if (playerParticipant.shirtNumber === newPlayer.number){
              this.addPlayerToTeam.emit(playerParticipant);
            }
          });
          this.playersGlobal = this.playersGlobal.filter(player => player.number !== newPlayer.number);
          console.log('Jugadores globales filtrados:', this.playersGlobal);
          if (this.playersGlobal.length === 0) {
            this.therArePlayersToADD = false;
          }
        }
      },
      error: (error) => {
        console.error('Error al agregar jugador:', error);
        this.alertService.errorAlert(error.error.error);
      }
    })
  }

  showReConfirmAlert(option: number) {
    this.alertService.confirmAlert('Agregar jugador', 'Estas seguro que quieres agregar a ' + this.playerForm.get('name')?.value + ' ' + this.playerForm.get('lastName')?.value + '?', 'Aceptar').then((result) => {
      if (result.isConfirmed) {
        let newPlayer: PlayerRequest = this.validateForm();
        if (newPlayer === null) {
          this.alertService.errorAlert('Faltan campos por llenar');
          return;
        }
        if (option === 1) {
          console.log('Agregando jugador al torneo:', newPlayer);
          this.addPlayerToTournament(newPlayer);
        } else {
          console.log('Agregando jugador al equipo global:', newPlayer);
          this.addPlayerToGlobal(newPlayer);
        }
      }
    });
  }

  validateForm() {
    let newPlayer = {
      teamId: this.playerForm.get('teamId')?.value,
      name: this.playerForm.get('name')?.value,
      lastName: this.playerForm.get('lastName')?.value,
      number: this.playerForm.get('number')?.value,
      isCaptain: this.playerForm.get('isCaptain')?.value,
      isGoalKeeper: this.playerForm.get('isGoalKeeper')?.value
    };
    return newPlayer;
  }

  mapPlayerNoParticipants(newPlayer: PlayerResponse): PlayerParticipantResponse {
    let playerMapped = {
      id: 0,
      shirtNumber: newPlayer.number,
      playerName: newPlayer.name,
      playerLastName: newPlayer.lastName,
      goals: 0,
      redCards: 0,
      yellowCards: 0,
      isSuspended: false,
      isMvp: 0,
      matchesPlayed: 0,
      status: newPlayer.status,
      isActive: false,
      isCaptain: newPlayer.isCaptain,
      isGoalKeeper: newPlayer.isGoalKeeper,
      playerId: newPlayer.id
    } as PlayerParticipantResponse;
    return playerMapped;
  }

  cancelAddPlayer() {
    this.clearValues();
    this.selectedPlayerId = 0;
    this.cancelAddPlayerEvent.emit();
  }

  existPlayerInTournament(ID: number): boolean {
    return this.teamParticipant.playerParticipants.some(player => player.id === ID);
  }

}