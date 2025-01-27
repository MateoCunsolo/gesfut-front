import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ParticipantResponse } from '../../../core/models/participantResponse';
import { INITIAL_PARTICIPANT } from '../../../core/services/tournament/initial-tournament';
import { DeleteComponent } from "../../list-teams/components/players/delete/delete.component";
import { AddPlayerComponent } from "../../list-teams/components/players/add-player/add-player.component";
import { MatchResponse, PlayerParticipantResponse } from '../../../core/models/tournamentResponse';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { AlertService } from '../../../core/services/alert.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-players-tournament',
  standalone: true,
  imports: [DeleteComponent, AddPlayerComponent],
  templateUrl: './players-tournament.component.html',
  styleUrls: ['./players-tournament.component.scss']
})
export class PlayersTournamentComponent implements OnChanges {

  private tournamentService = inject(TournamentService);
  private alertService = inject(AlertService);
  private dashboardService = inject(DashboardService);

  @Input() teamParticipant: ParticipantResponse = INITIAL_PARTICIPANT;
  @Input() code: string = '';
  flagAddPlayer: boolean = false;
  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['teamParticipant']) {
      this.teamParticipant = changes['teamParticipant'].currentValue;
      console.log(this.teamParticipant);
    }
  }

  returnIfIsGlobalOrNot() {
    return this.teamParticipant.idTeam;
  }

  areThereParticipanForThisTeam() {
    return this.teamParticipant.idParticipant;
  }



  showFormAddPlayer() {
    this.flagAddPlayer = !this.flagAddPlayer;
  }

  toLastMatches() {
    if (this.teamParticipant.idParticipant) {
      this.alertService.loadingAlert('OBTENIENDO ULTIMOS PARTIDOS');
      this.tournamentService.getMatchesAllForParticipant(this.code, this.teamParticipant.idParticipant).subscribe({
        next: (response: MatchResponse[]) => {
          sessionStorage.setItem('matches', JSON.stringify(response));
          sessionStorage.setItem('teamNameMatches', this.teamParticipant.name);
          this.dashboardService.setActiveTournamentComponent('lasts-matches');
          this.alertService.closeLoadingAlert();
        }
      });
    } else {
      this.alertService.errorAlert('No se ha seleccionado un equipo');
    }
  }



  deleteTeam() {
    this.alertService.infoAlert('ELIMINAR EQUIPO','FUNCIONALIDAD NO IMPLEMENTADA');
  }

  addPlayerToTeam(player: PlayerParticipantResponse) {
    this.teamParticipant.playerParticipants.push(player);
  }

  deletePlayer(playerId: number) {
    this.teamParticipant.playerParticipants = this.teamParticipant.playerParticipants.filter(player => player.playerId !== playerId);
  }


}
