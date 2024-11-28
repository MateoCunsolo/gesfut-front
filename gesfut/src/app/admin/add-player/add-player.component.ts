import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ParticipantResponse, PlayerParticipantResponse } from '../../core/models/tournamentResponse';
import { TeamService } from '../../core/services/tournament/team.service';
import { PlayerResponse, TeamResponse } from '../../core/models/teamResponse';
import { ParticipantShortResponse } from '../../core/models/participantShortResponse';
import { TournamentService } from '../../core/services/tournament/tournament.service';

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss'],
  inputs: ['teamName', 'teamPlayers']
})
export class AddPlayerComponent {
  // Inputs desde el componente padre
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

  // Inyectar servicios
  private alertService = inject(AlertService);
  private tournamentService = inject(TournamentService);
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  // Formulario reactivo
  playerForm: FormGroup;

  constructor() {
    this.playerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      number: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
      isCaptain: [false],
      isGoalKeeper: [false],
    });
  }

  validateExistPlayerGlobal(playerData: PlayerResponse) {
    const duplicate = this.selectTeam.players.some(
      (player) => player.number === playerData.number
    );
    const nameDuplicate = this.selectTeam.players.some(
      (player) => player.name.toLowerCase() === playerData.name.toLowerCase() && player.lastName.toLowerCase() === playerData.lastName.toLowerCase()
    );
    const captain = this.selectTeam.players.some(
      (player) => player.isCaptain === true
    );
    if (nameDuplicate) {
      this.alertService.errorAlert('Ya existe un jugador con ese nombre y apellido en el equipo.');
      return;
    }
    if (playerData.isCaptain && captain) {
      this.alertService.errorAlert('Ya existe un capitán en el equipo.');
      return;
    }
    if (duplicate) {
      this.alertService.errorAlert(`Ya existe un jugador con el dorsal ${playerData.number}.`);
      return;
    }
  }


  addPlayerToTeam() {
    const playerData = this.playerForm.value;
    if (this.playerForm.invalid) {
      this.alertService.errorAlert('Por favor, llena todos los campos correctamente.');
      return;
    }
    this.validateExistPlayerGlobal(playerData);
    this.alertService.loadingAlert('Agregando jugador...');
    if (this.isGlobalTeam) {
      this.addToGlobalTeam(playerData);
    } else {
      this.addToTournamentParticipant(playerData);
    }

  }

  addToTournamentParticipant(playerData: PlayerResponse) {
    this.tournamentService.addPlayerToParticipant(this.participantTournament.codeTournament, this.participantTournament.idParticipant, playerData).subscribe({
      next: (response: ParticipantResponse) => {
        console.log('Evento emitido:', response);
        this.alertService.successAlert('Jugador agregado correctamente.');
        this.participantRefresh.emit(response);
        this.playerForm.reset();
      },
      error: () => {
        this.alertService.errorAlert('Error al agregar jugador.');
      },
    });
  }
  

  addToGlobalTeam(playerData: PlayerResponse) {
    this.teamService.addPlayerToTeam(this.selectTeam.id, playerData).subscribe({
      next: () => {
        this.alertService.successAlert('Jugador agregado correctamente.');
        this.playerForm.reset();
      },
      error: () => {
        this.alertService.errorAlert('Error al agregar jugador.');
      },
    });
  }


  cancel() {
    this.playerForm.reset();
    this.alertService.infoAlert('Acción cancelada', 'No se ha agregado ningún jugador.');
  }
}

