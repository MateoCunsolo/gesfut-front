import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert.service';
import { TeamService } from '../../../../../core/services/tournament/team.service';
import { TournamentService } from '../../../../../core/services/tournament/tournament.service';
import { PlayerRequest } from '../../../../../core/models/teamRequest';
import { PlayerParticipantResponse } from '../../../../../core/models/tournamentResponse';
import { PlayerResponse } from '../../../../../core/models/teamResponse';
import { forkJoin, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-player',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss'],
  inputs: ['teamName', 'teamPlayers']
})
export class AddPlayerComponent implements OnInit, OnChanges {

  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private teamService = inject(TeamService);
  private tournamentService = inject(TournamentService);
  private route = inject(Router);
  @Input() teamIdParticipant: number = 0;
  @Input() teamIdGlobal: number = 0;
  @Input() codeTournament: string = '';
  @Output() public addPlayerToTeam = new EventEmitter<PlayerParticipantResponse>();
  @Output() public cancelAddPlayerEvent = new EventEmitter<void>();
  protected playersGlobal: PlayerResponse[] = [];
  protected selectedPlayerId: number = 0;
  protected therArePlayersToADD: boolean = false;
  playerForm: FormGroup;

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

  ngOnInit() {
  }


  async existInTournament(playerId: number): Promise<boolean> {
    try {
      console.log('teamIdParticipant:', this.teamIdParticipant);
      const response = await this.tournamentService.getTournamentParticipantTeamByID(this.teamIdParticipant).toPromise();
      if (!response) {
        return false;
      }
      return response.playerParticipants.some(player => player.playerId === playerId);
    } catch (error) {
      console.log(this.i = this.i + 1);

      console.error('Error al obtener equipo participante:', error);
      return false;
    }
  }

  i: number = 0;

  async callPlayerGlobals() {
    try {
      const response = await this.teamService.getTeam(this.teamIdGlobal).toPromise();
      if (!response) {
        return;
      }

      if (response.players.length === 0) {
        this.therArePlayersToADD = false;
        return;
      }

      const filteredPlayers = await Promise.all(
        response.players.map(async (player) => {
          const exists = await this.existInTournament(player.id);
          return exists ? null : player;
        })
      );
      this.playersGlobal = filteredPlayers.filter(player => player !== null);

      if (this.playersGlobal.length === 0) {
        this.therArePlayersToADD = false;
      } else {
        this.therArePlayersToADD = true;
      }

      
      console.log('Jugadores globales:', this.playersGlobal);

    } catch (error) {
      console.error('Error al obtener jugadores globales:', error);
    }
  }

  changePlayer(event: Event) {
    const selectedPlayerId = Number((event.target as HTMLSelectElement).value);
    const player = this.playersGlobal.find(player => player.id === selectedPlayerId);

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
    this.clearValues();
  }

  clearValues() {
    this.playerForm.reset({
      teamId: this.teamIdParticipant,
      isCaptain: false,
      isGoalKeeper: false
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamIdParticipant'] || changes['teamIdGlobal']) {
      this.playerForm.get('teamId')?.setValue(this.teamIdParticipant);
      if(this.teamIdParticipant != 0){
        this.callPlayerGlobals();
      }
      this.verifyIfAreThereParticipantsForThisTeam();
      console.log('teamIdGlobal:', this.teamIdGlobal);
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



  addPlayer() {
    if (this.playerForm.invalid) {
      this.showErrors();
      return;
    }
    if (this.teamIdParticipant != 0 && this.selectedPlayerId == 0) {
      if (this.route.url.includes('tournament')) {
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
    this.playersGlobal = this.playersGlobal.filter(player => player.number !== this.playerForm.get('number')?.value);
    if (this.playersGlobal.length === 0) {
      this.therArePlayersToADD = false;
    }
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
        this.playersGlobal.push(response);
      },
      error: (error) => {
        console.error('Error al agregar jugador:', error);
        this.alertService.errorAlert(error.error.error);
      }
    })
  }

  addPlayerToTournament(newPlayer: PlayerRequest) {
    console.log('Codigo de torneo:', this.codeTournament);
    this.tournamentService.addPlayerToParticipant(this.codeTournament, this.teamIdParticipant, newPlayer).subscribe({
      next: (response) => {
        this.alertService.successAlert('Jugador agregado');
        this.clearValues();
        this.selectedPlayerId = 0;
        if (response) {
          response.playerParticipants.forEach(playerParticipant => {
            if (playerParticipant.playerName === newPlayer.name && playerParticipant.playerLastName === newPlayer.lastName) {
              this.addPlayerToTeam.emit(playerParticipant);
            }
          });
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
        console.log('Nuevo jugador:', newPlayer);
        if (option === 1) {
          this.addPlayerToTournament(newPlayer);
        } else {
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

}