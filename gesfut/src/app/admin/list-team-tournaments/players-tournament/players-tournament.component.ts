import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ParticipantResponse } from '../../../core/models/participantResponse';
import { emptyParticipant } from '../../../core/services/tournament/initial-tournament';
import { DeleteComponent } from '../../list-teams/components/players/delete/delete.component';
import { AddPlayerComponent } from '../../list-teams/components/players/add-player/add-player.component';
import {
  MatchResponse,
  PlayerParticipantResponse,
} from '../../../core/models/tournamentResponse';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { AlertService } from '../../../core/services/alert.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/manager/auth.service';
import { SessionService } from '../../../core/services/manager/session.service';
import { GuestService } from '../../../core/services/guest/guest.service';
import { TeamRemovalService } from '../../../core/services/tournament/team-removal.service';

@Component({
  selector: 'app-players-tournament',
  imports: [DeleteComponent, AddPlayerComponent],
  templateUrl: './players-tournament.component.html',
  styleUrls: ['./players-tournament.component.scss'],
})
export class PlayersTournamentComponent implements OnChanges {
  // Loop 2: plantel ordenado por dorsal.
  byShirtNumber<T extends { shirtNumber?: number | null }>(players: T[] | null | undefined): T[] {
    return [...(players ?? [])].sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999));
  }

  private tournamentService = inject(TournamentService);
  private alertService = inject(AlertService);
  private dashboardService = inject(DashboardService);
  private guestService = inject(GuestService);
  private sessionService = inject(SessionService);
  private teamRemoval = inject(TeamRemovalService);
  private isFinishedTournament: boolean = false;

  @Input() teamParticipant: ParticipantResponse = emptyParticipant();
  @Input() code: string = '';

  flagAddPlayer: boolean = false;
  /** Nombre del torneo cargado por código (contexto visible en el alta). */
  tournamentName = '';
  /** Al cancelar el alta, el foco vuelve al botón "Agregar jugador" que la abrió. */
  private focusAddTriggerPending = false;
  @ViewChild('addPlayerTrigger') set addPlayerTrigger(el: ElementRef<HTMLButtonElement> | undefined) {
    if (el && this.focusAddTriggerPending) {
      this.focusAddTriggerPending = false;
      setTimeout(() => {
        el.nativeElement.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
        el.nativeElement.focus({ preventScroll: true });
      });
    }
  }

  isAuth: boolean = false;
  playerDeleted: { idPlayer: number; idPlayerParticipant: number } = {
    idPlayer: 0,
    idPlayerParticipant: 0,
  };

  constructor() {}

  ngOnInit() {
    this.isAuth = this.sessionService.isAuth();
    this.tournamentService.currentTournament.subscribe({
      next: (response) => {
        this.isFinishedTournament = response.isFinished;
        this.tournamentName = response?.name ?? '';
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['teamParticipant']) {
      this.teamParticipant = changes['teamParticipant'].currentValue;
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

  cancelAddPlayer() {
    this.focusAddTriggerPending = true;
    this.flagAddPlayer = false;
  }

  toLastMatches() {
    if (this.teamParticipant.idParticipant) {
      this.alertService.loadingAlert('OBTENIENDO ULTIMOS PARTIDOS...');
      this.tournamentService
        .getMatchesAllForParticipant(
          this.code,
          this.teamParticipant.idParticipant
        )
        .subscribe({
          next: (response: MatchResponse[]) => {
            this.tournamentService.setMatches(response);
            this.tournamentService.setNameTeamToViewEvents(
              this.teamParticipant.name
            );
            if (this.isAuth)
              this.dashboardService.setActiveTournamentComponent(
                'lasts-matches'
              );
            else this.guestService.setActiveComponent('lasts-matches');
            this.alertService.closeLoadingAlert();
          },
        });
    } else {
      this.alertService.errorAlert('No se ha seleccionado un equipo');
    }
  }

  /** Plan 22/10 #2: misma regla que en Mis equipos (borra si nunca jugó, si no deshabilita y da de baja del torneo). */
  async deleteTeam() {
    if (!this.teamParticipant.idTeam || !this.teamParticipant.name) { this.alertService.errorAlert('No se ha seleccionado un equipo'); return; }
    if (this.removing) return;
    this.removing = true;
    // Review 24/10: referencia tomada ANTES del await; si se cambia de equipo con el dialogo abierto, se marca el original.
    const target = this.teamParticipant;
    let action: 'DELETE' | 'DISABLE' | null = null;
    try { action = await this.teamRemoval.remove(target.idTeam, target.name); } finally { this.removing = false; }
    if (action) target.isActive = false;
  }
  removing = false;

  addPlayerToTeam(player: PlayerParticipantResponse) {
    this.teamParticipant.playerParticipants.push(player);
  }

  deletePlayer(playerId: number) {
    this.playerDeleted = {
      idPlayer: playerId,
      idPlayerParticipant:
        this.teamParticipant.playerParticipants.find(
          (player) => player.playerId === playerId
        )?.id || 0,
    };

    this.teamParticipant.playerParticipants =
      this.teamParticipant.playerParticipants.filter(
        (player) => player.playerId !== playerId
      );
  }
}
