import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ParticipantResponse } from '../../../core/models/participantResponse';
import { INITIAL_PARTICIPANT } from '../../../core/services/tournament/initial-tournament';
import { DeleteComponent } from "../../list-teams/components/players/delete/delete.component";
import { AddPlayerComponent } from "../../list-teams/components/players/add-player/add-player.component";
import { MatchResponse, PlayerParticipantResponse } from '../../../core/models/tournamentResponse';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { AlertService } from '../../../core/services/alert.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/manager/auth.service';
import { SessionService } from '../../../core/services/manager/session.service';
import { GuestService } from '../../../core/services/guest/guest.service';

@Component({
    selector: 'app-players-tournament',
    imports: [DeleteComponent, AddPlayerComponent],
    templateUrl: './players-tournament.component.html',
    styleUrls: ['./players-tournament.component.scss']
})
export class PlayersTournamentComponent implements OnChanges {

  private tournamentService = inject(TournamentService);
  private alertService = inject(AlertService);
  private dashboardService = inject(DashboardService);
  private guestService = inject(GuestService);
  private sessionService = inject(SessionService);

  @Input() teamParticipant: ParticipantResponse = INITIAL_PARTICIPANT;
  @Input() code: string = '';

  flagAddPlayer: boolean = false;
  isAuth: boolean = false;

  constructor() { }

  ngOnInit() {
    this.isAuth = this.sessionService.isAuth();
  }


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
          if(this.isAuth)this.dashboardService.setActiveTournamentComponent('lasts-matches');
          else this.guestService.setActiveComponent('lasts-matches');
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
