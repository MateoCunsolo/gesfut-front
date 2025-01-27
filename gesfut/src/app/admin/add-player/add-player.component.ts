import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, inject, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ParticipantResponse, PlayerParticipantResponse } from '../../core/models/tournamentResponse';
import { TeamService } from '../../core/services/tournament/team.service';
import { PlayerResponse, TeamResponse } from '../../core/models/teamResponse';
import { ParticipantShortResponse } from '../../core/models/participantShortResponse';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss'],
  inputs: ['teamName', 'teamPlayers']
})
export class AddPlayerComponent implements OnInit {
  // Inputs desde el componente padre
  selectTeamCopy: TeamResponse = {} as TeamResponse;
  teamSelect: number = 0;
  @Input() selectTeam: TeamResponse = {
    id: 0,
    name: '',
    color: '',
    status: false,
    players: [],
  };
  @Input() isGlobalTeam: boolean = false;
  @Input() participantTournament: ParticipantShortResponse = {
    nameTournament: '',
    codeTournament: '',
    idParticipant: 0,
    playerParticipants: [],
    isActive: false,
  }

  //EVNIAR A COMPONENTE PADRE
  // Outputs hacia el componente padre
  @Output() participantRefresh = new EventEmitter<ParticipantResponse>();
  @Output() closeForm = new EventEmitter<Boolean>();
  // Inyectar servicios
  private alertService = inject(AlertService);
  private tournamentService = inject(TournamentService);
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private route = inject(Router);
  private dashboardService = inject(DashboardService);
  // Formulario reactivo
  playerForm: FormGroup;
  changeView: boolean = false;
  teamsParticipants: ParticipantResponse[] = [];
  formControlName: FormGroup;
  constructor() {
    this.playerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      number: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
      isCaptain: [false],
      isGoalKeeper: [false],
    });
    this.formControlName = this.fb.group({
      team: [0, [Validators.required]],
    });
  }

  validateExistPlayerGlobal(playerData: PlayerResponse): Boolean {
    const duplicate = this.selectTeam.players.some(
      (player) => player.number == playerData.number
    );
    const nameDuplicate = this.selectTeam.players.some(
      (player) => player.name.toLowerCase() == playerData.name.toLowerCase() && player.lastName.toLowerCase() == playerData.lastName.toLowerCase()
    );
    const captain = this.selectTeam.players.some(
      (player) => player.isCaptain == true
    );
    if (nameDuplicate) {
      if (this.isGlobalTeam) {
        this.alertService.errorAlert('YA EXISTE ' + playerData.name + ' ' + playerData.lastName + ' EN ' + this.selectTeam.name + ' GLOBAL.');

      } else {
        this.alertService.errorAlert('YA EXISTE ' + playerData.name + ' ' + playerData.lastName + ' EN ' + this.selectTeam.name);
      }
      return false;
    }
    if (playerData.isCaptain && captain) {
      this.alertService.errorAlert('Ya existe un capitán en el equipo.');
      return false;
    }
    if (duplicate) {
      this.alertService.errorAlert(`Ya existe un jugador con el dorsal ${playerData.number}.`);
      return false;
    }
    return true;
  }


  ngOnDestroy(): void {

  }

  selectTeamViewBig(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.teamSelect = Number(selectElement.value);
    if (this.teamSelect != 0 && this.teamSelect != null && this.teamSelect != undefined) {
      this.teamService.getTeam(this.teamSelect).subscribe({
        next: (response) => {
          this.selectTeam = response;
          this.teamService.getParticipantsShortAllTournamemts(this.teamSelect).subscribe({
            next: (response) => {
              response.forEach((tournament) => {
                this.teamsParticipants.forEach((participant) => {
                  if (participant.idParticipant == tournament.idParticipant) {
                    this.participantTournament = tournament;
                  }
                });
              });
            }
          });
        }
      });
    } else {
      console.log('No se ha seleccionado ningun equipo');
    }
  }



  addPlayerToTeam() {
    const playerData = this.playerForm.value;
    if (this.playerForm.invalid) {
      this.alertService.errorAlert('Por favor, llena todos los campos correctamente.');
      return;
    }
    if (this.validateExistPlayerGlobal(playerData)) {

      if (this.isGlobalTeam) {
        this.alertService.loadingAlert('Agregando jugador...');
        this.addToGlobalTeam(playerData);
      } else {
        this.alertService.loadingAlert('Agregando jugador...');
        this.addToTournamentParticipant(playerData);
      }
    }
  }


  addToTournamentParticipant(playerData: PlayerResponse) {
    if (this.validateIfExistInTourament(playerData)) {
      this.alertService.errorAlert('Ese jugador ya está jugando en el torneo.');
      return;
    }

    const player = this.participantTournament.playerParticipants.find((p) => p.shirtNumber === playerData.number);
    if (player) {
      console.log(player);
      if (!player.isActive) {
        console.log('Activando jugador');
        //si se activa el jugador no me lo muestra en el arreglo de jugadores normale
        this.tournamentService.changeStatusPlayer(this.participantTournament.codeTournament,player.id,true).subscribe({
          next: () => {
            this.alertService.successAlert('Jugador agregado correctamente.');
            this.playerForm.reset();
            this.closeForm.emit(false);
          },
          error: (error) => {
            this.alertService.errorAlert(error.error.error);
          },
        });
      } 
    }else{
      console.log('NUEVO JUGADOR');
      this.tournamentService.addPlayerToParticipant(this.participantTournament.codeTournament, this.participantTournament.idParticipant, playerData).subscribe({
        next: (response: ParticipantResponse) => {
          this.alertService.successAlert('Jugador agregado correctamente.');
          this.playerForm.reset();
          this.closeForm.emit(false);
          if (this.changeView) {
            this.tournamentService.getTournamentFull(this.participantTournament.codeTournament).subscribe({
              next: (response) => {
                this.tournamentService.currentTournament.next(response);
              }
            });
          }
          this.participantRefresh.emit(response);
        },
        error: (error) => {
          this.alertService.errorAlert(error.error.error);
        },
      });
    }
  }

  validateIfExistInTourament(playerData: PlayerResponse): Boolean {
    let flag = false;
    this.participantTournament.playerParticipants.forEach((player) => {
      if (player.shirtNumber == playerData.number) {
        flag = true;
        if (player.isActive == false) {
          flag = false;
        }
      }
      if (player.playerName.toLowerCase() == playerData.name.toLowerCase() && player.playerLastName.toLowerCase() == playerData.lastName.toLowerCase()) {
        flag = true;
        if (player.isActive == false) {
          flag = false;
        }
      }
    });
    return flag;
  }

  addToGlobalTeam(playerData: PlayerResponse) {
    this.teamService.addPlayerToTeam(this.selectTeam.id, playerData).subscribe({
      next: () => {
        this.alertService.successAlert('Jugador agregado correctamente.');
        this.selectTeam.players.push(playerData);
        this.participantRefresh.emit();
        this.playerForm.reset();
        this.closeForm.emit(false);
      },
      error: (error) => {
        this.alertService.errorAlert(error.error.error);
      },
    });
  }


  cancel() {
    this.playerForm.reset();
    this.alertService.infoAlert('Acción cancelada', 'No se ha agregado ningún jugador.');
    this.closeForm.emit(false);
    if (this.changeView) {
      this.dashboardService.setActiveTournamentComponent('dashboard');
    }
  }

  ngOnInit() {
    console.log(this.selectTeam);
    console.log(this.participantTournament); // tiene todos los jugadors sin importar si es activo o false,
    console.log(this.isGlobalTeam);
    this.dashboardService.activeTournamentComponent$.subscribe({
      next: (component) => {
        if (component === 'add-player') {
          this.changeView = true;
          this.tournamentService.currentTournament.subscribe({
            next: (response) => {
              this.teamsParticipants = response.participants;
            },
          });
        }
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.isGlobalTeam);
    this.selectTeamCopy = JSON.parse(JSON.stringify(this.selectTeam));
    if (changes['isGlobalTeam']) {
      if (!this.isGlobalTeam) {
        this.participantTournament.playerParticipants.forEach((participantPlayer) => {
          this.selectTeamCopy.players = this.selectTeamCopy.players.filter(
            (teamPlayer) => participantPlayer.isActive == false || teamPlayer.number != participantPlayer.shirtNumber
          );
        });
      }
    } else if (this.route.url.includes('tournaments')) {
      this.participantTournament.playerParticipants.forEach((participantPlayer) => {
        this.selectTeamCopy.players = this.selectTeamCopy.players.filter(
          (teamPlayer) => teamPlayer.number != participantPlayer.shirtNumber
        );
      });
    }
  }
}

