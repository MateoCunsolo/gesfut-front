import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TeamService } from '../../../../core/services/tournament/team.service';
import { ParticipantShortResponse } from '../../../../core/models/participantShortResponse';
import { AlertService } from '../../../../core/services/alert.service';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

@Component({
    selector: 'app-names-tournaments',
    imports: [NgClass, FormsModule, SpinnerComponent],
    templateUrl: './names-tournaments.component.html',
    styleUrl: './names-tournaments.component.scss'
})
export class NamesTournamentsComponent implements OnChanges {
  @Output() public participantSelected = new EventEmitter<number>();
  @Output() public globalsPlayer = new EventEmitter();
  @Output() public onlyGlobalTeams = new EventEmitter<boolean>();
  @Output() public codeTournament = new EventEmitter<string>();
  @Output() public tournamentSelected = new EventEmitter<string>();
  @Input() public id: number = 0;

  private teamService = inject(TeamService);
  private alertService = inject(AlertService);
  protected therAreNotParticipants: boolean = false;
  protected participantsTeam: ParticipantShortResponse[] = [];
  protected isClicked: boolean = false;
  protected spinner: boolean = true;
  protected selectedParticipantId: number | null = null;
  selectedTournament: number = this.participantsTeam.length ? this.participantsTeam[0].idParticipant : 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.getAllParticipantsTournament(this.id);
      this.spinner = true;
    }
  }

  emitThatIsGlobalTeam() {
    this.alertService.infoAlert(
      'AVISO IMPORTANTE',
      'LOS JUGADORES QUE SE MOSTRARAN ABARCA A TODOS LOS QUE FUERON AGREGADOS ALGUNA VEZ A ESTE EQUIPO, ESTEN O NO JUGANDO UN TORNEO.'
    );
    this.isClicked = true;
    this.selectedParticipantId = null;
    this.onlyGlobalTeams.emit(true);
    this.selectedTournament = 0;
  }

  getAllParticipantsTournament(id: number) {
    this.teamService.getParticipantsShortAllTournamemts(id).subscribe({
      next: (response) => {
        this.spinner = false;
        this.participantsTeam = response;
        if (this.participantsTeam.length > 0) {
          this.therAreNotParticipants = false;
          this.participantSelected.emit(this.participantsTeam[0].idParticipant);
          this.codeTournament.emit(this.participantsTeam[0].codeTournament);
          this.tournamentSelected.emit(this.participantsTeam[0].nameTournament);
          this.selectedParticipantId = this.participantsTeam[0].idParticipant;
          this.isClicked = false;
          this.onlyGlobalTeams.emit(false);
          this.selectedTournament = this.participantsTeam[0].idParticipant;
        } else {
          this.therAreNotParticipants = true;
          this.globalsPlayer.emit(id);
          this.onlyGlobalTeams.emit(true);
        }
      },
      error: (error) => {
        console.error('Error al obtener los participantes:', error);
      },
    });
  }

  showPlayersFromOptional(idParticipant: Event) {
    if ((idParticipant.target as HTMLInputElement).value === '0') {
      this.emitThatIsGlobalTeam();
    } else {
      this.showPlayers(
        parseInt((idParticipant.target as HTMLInputElement).value)
      );
    }
  }

  showPlayers(idParticipant: number) {
    this.selectedParticipantId = idParticipant;
    this.selectedTournament = idParticipant;
    this.isClicked = false;
    this.onlyGlobalTeams.emit(false);
    this.participantSelected.emit(idParticipant);
    this.codeTournament.emit(
      this.participantsTeam.find((participant) => participant.idParticipant === idParticipant)?.codeTournament || ''
    );
    this.tournamentSelected.emit(
      this.participantsTeam.find((participant) => participant.idParticipant === idParticipant)?.nameTournament || ''
    );
  }
}
