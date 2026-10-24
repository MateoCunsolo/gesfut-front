import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TeamRemovalService } from '../../../../core/services/tournament/team-removal.service';
import { MatchResponse, ParticipantResponse, PlayerParticipantResponse } from '../../../../core/models/tournamentResponse';
import { emptyParticipant } from '../../../../core/services/tournament/initial-tournament';
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

const emptyGlobalStats = (): TeamWithAllStatsPlayerResponse => ({ idTeam: 0, name: '', status: true, playerParticipants: [] } as unknown as TeamWithAllStatsPlayerResponse);

@Component({
  selector: 'app-players',
  imports: [DeleteComponent, AddPlayerComponent],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnChanges {
  /** Retest 24/10: mensaje explicito cuando el equipo no tiene jugadores (activos). */
  hasPlayers(list: any[] | null | undefined, flag: string): boolean { return (list ?? []).some(p => !!p?.[flag]); }
  // Loop 2: plantel ordenado por dorsal.
  byShirtNumber<T extends { shirtNumber?: number | null }>(players: T[] | null | undefined): T[] {
    return [...(players ?? [])].sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999));
  }


  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);
  private alertService = inject(AlertService);
  private dashboardService = inject(DashboardService);
  private guestService = inject(GuestService);
  private route = inject(Router);
  private teamRemoval = inject(TeamRemovalService);
  /** Plan 22/10 #2: avisa a la lista que el equipo se borró o cambió de estado. */
  @Output() teamChanged = new EventEmitter<{ id: number; action: 'DELETE' | 'DISABLE' | 'ENABLE' }>();
  /** Estado del equipo (false = deshabilitado). */
  protected teamEnabled = true;
  protected teamName = '';
  /** Nombre del equipo que muestra el encabezado de Mis equipos: la accion se frena si no coincide. */
  @Input() headerName = '';
  removing = false;
  @Input() public participantId: number | null = null;
  @Input() public idTeam: number | null = null;
  @Input() public thereAreNotParticipants: boolean = false;
  @Input() public isGlobalTeam: boolean = false;
  @Input() public code: string = '';
  @Input() public nameTournament: string = '';
  protected isGlobalTeamPlayers: boolean = false;
  protected participantTeam: ParticipantResponse = emptyParticipant();
  protected participantGlobalStats: TeamWithAllStatsPlayerResponse = emptyGlobalStats();
  /** Review 24/10: mientras carga se muestra "Cargando…", nunca filas del equipo anterior. */
  protected loadingPlayers = false;
  protected flagAddPlayer: boolean = false;
  protected playerDeleted: { idPlayer: number, idPlayerParticipant: number } = { idPlayer: 0, idPlayerParticipant: 0 };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    // Review 24/10 (bug Mis equipos): al cambiar de equipo se invalidan las cargas en curso y se vacian los datos
    // ANTES de pedir nada; el participantId viejo no se usa para el equipo nuevo.
    const teamChanged = !!changes['idTeam'];
    if (teamChanged) this.resetTeamData();
    if (this.isGlobalTeam) {
      if (teamChanged || changes['isGlobalTeam']) {
        if (this.idTeam) { this.getPlayersGlobal(this.idTeam); } else if (!teamChanged) { this.alertService.errorAlert('No se pudo identificar el equipo. Volv\u00e9 a elegirlo en la lista.'); }
      }
    } else if ((changes['participantId'] || changes['isGlobalTeam']) && this.participantId) {
      this.getPlayersParticipants(this.participantId);
    }

    if (teamChanged && this.idTeam) this.loadTeamStatus(this.idTeam);

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

  /** Retest 24/10: cada carga lleva un numero; las respuestas tardias de un equipo/torneo anterior se descartan. */
  private loadSeq = 0;
  private isCurrent(seq: number): boolean { return seq === this.loadSeq; }

  private resetTeamData() {
    ++this.loadSeq;
    this.participantTeam = emptyParticipant();
    this.participantGlobalStats = emptyGlobalStats();
    this.teamEnabled = true;
    this.teamName = '';
    this.loadingPlayers = true;
  }

  getPlayersGlobal(idTeam: number) {
    const seq = ++this.loadSeq;
    this.loadingPlayers = true;
    this.teamService.getTeam(idTeam).subscribe({
      next: (response) => {
        if (!this.isCurrent(seq) || idTeam !== this.idTeam) return;
        if (response) {
          this.mapPlayersGlobal(response, seq);
        } else this.loadingPlayers = false;
      },
      error: () => { if (this.isCurrent(seq)) this.loadingPlayers = false; }
    });
  }

  getPlayersParticipants(idParticipant: number) {
    const seq = ++this.loadSeq;
    this.loadingPlayers = true;
    this.tournamentService.getTournamentParticipantTeamByID(idParticipant).subscribe({
      next: (response) => {
        if (!this.isCurrent(seq) || idParticipant !== this.participantId) return;
        this.loadingPlayers = false;
        if (!this.isGlobalTeam && response) {
          this.participantTeam = { ...response, playerParticipants: response.playerParticipants ?? [] };
        }
      },
      error: () => { if (this.isCurrent(seq)) this.loadingPlayers = false; }
    });
  }


  deletePlayer(idPlayerGlobal: number) {
    this.playerDeleted = {
      idPlayer: idPlayerGlobal,
      idPlayerParticipant: this.participantTeam.playerParticipants.find(player => player.playerId === idPlayerGlobal)?.id || 0
    }

    if (this.isGlobalTeam) {
      this.participantGlobalStats.playerParticipants = this.participantGlobalStats.playerParticipants.filter(player => player.playerId !== idPlayerGlobal);
    } else { 
      this.participantTeam.playerParticipants = this.participantTeam.playerParticipants.filter(player => player.playerId !== idPlayerGlobal);
    }
  }

  /** Editar jugador: datos del plantel; el historial queda en el mismo jugador. */
  editPlayer(player: any) {
    const teamId = this.isGlobalTeam ? this.participantGlobalStats.idTeam : this.participantTeam.idTeam;
    this.teamService.getTeam(teamId).subscribe({
      next: async (team: any) => {
        const current = (team?.players ?? []).find((p: any) => p.id === player.playerId);
        const data = await this.alertService.editPlayerAlert({
          name: current?.name ?? player.playerName, lastName: current?.lastName ?? player.playerLastName,
          number: current?.number ?? player.shirtNumber, dni: current?.dni ?? null });
        if (!data) return;
        this.teamService.editPlayer(player.playerId, data).subscribe({
          next: () => {
            const rows = [...(this.participantGlobalStats.playerParticipants ?? []), ...(this.participantTeam.playerParticipants ?? [])] as any[];
            rows.filter(r => r.playerId === player.playerId).forEach(r => { r.playerName = data.name; r.playerLastName = data.lastName; r.shirtNumber = data.number; });
            this.alertService.successAlert('Jugador actualizado');
          },
          error: (e) => this.alertService.errorAlert(e?.error?.error ?? e?.error?.message ?? 'No se pudo editar el jugador.')
        });
      },
      error: () => this.alertService.errorAlert('No se pudo cargar el jugador.')
    });
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


  mapPlayersGlobal(response: TeamResponse, seq: number = this.loadSeq) {
    this.teamService.getAllStatsPlayersFromTeam(response.id).subscribe({
      next: (response) => {
        if (!this.isCurrent(seq)) return;
        this.loadingPlayers = false;
        if (response) {
          this.participantGlobalStats = { ...response, playerParticipants: response.playerParticipants ?? [] };
        }
      },
      error: () => { if (this.isCurrent(seq)) this.loadingPlayers = false; }


    });
  }


  showFormAddPlayer() {
    this.flagAddPlayer = true;
  }

  cancelAddPlayerEvent() {
    this.focusAddTriggerPending = true;
    this.flagAddPlayer = false;
  }
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


  addPlayerToTeam(newPlayer: PlayerParticipantResponse) {
    if (this.isGlobalTeam) {
      //antes de agregar
      this.participantGlobalStats.playerParticipants.push(newPlayer);
    } else {
      this.participantTeam.playerParticipants.push(newPlayer);
    }
  }

  private loadTeamStatus(idTeam: number) {
    this.teamService.getTeam(idTeam).subscribe({ next: (t) => { if (idTeam !== this.idTeam) return; if (t) { this.teamEnabled = t.status !== false; this.teamName = t.name; } }, error: () => {} });
  }

  private currentTeamId(): number | null {
    return this.idTeam || this.returnIfIsGlobalOrNot() || null;
  }

  /** Plan 22/10 #2: borra si nunca jugó; si jugó lo deshabilita (el diálogo dice cuál de las dos). */
  async deleteTeam() {
    const id = this.currentTeamId();
    if (!id) { this.alertService.errorAlert('No se ha seleccionado un equipo'); return; }
    if (this.removing) return;
    this.removing = true;
    let action: 'DELETE' | 'DISABLE' | null = null;
    try { action = await this.teamRemoval.remove(id, this.headerName); } finally { this.removing = false; }
    if (!action) return;
    if (action === 'DISABLE') this.teamEnabled = false;
    this.teamChanged.emit({ id, action });
  }

  async enableTeam() {
    const id = this.currentTeamId();
    if (!id) return;
    if (await this.teamRemoval.enable(id, this.teamName || this.participantGlobalStats.name || this.participantTeam.name)) {
      this.teamEnabled = true;
      this.teamChanged.emit({ id, action: 'ENABLE' });
    }
  }

  toLastMatches() {
    if (this.isGlobalTeam) {
      this.alertService.errorAlert('Debes selecionar un torneo para ver los partidos.');
    } else if (this.participantId) {
      this.alertService.loadingAlert('OBTENIENDO ULTIMOS PARTIDOS');
      this.tournamentService.getMatchesAllForParticipant(this.code, this.participantTeam.idParticipant).subscribe({
        next: (response: MatchResponse[]) => {
          this.tournamentService.setMatches(response);
          this.tournamentService.setNameTeamToViewEvents(this.participantTeam.name);
          this.dashboardService.setActiveDashboardAdminComponent('lasts-matches');
          sessionStorage.setItem('viewingTournamentName', this.nameTournament);
          this.alertService.closeLoadingAlert();
        }
      });
    } else {
      this.alertService.errorAlert('No se ha seleccionado un equipo');
    }
  }

}
