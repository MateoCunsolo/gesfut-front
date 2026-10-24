import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TeamRemovalService } from '../../../../core/services/tournament/team-removal.service';
import { MatchResponse, ParticipantResponse, PlayerParticipantResponse } from '../../../../core/models/tournamentResponse';
import { INITIAL_PARTICIPANT } from '../../../../core/services/tournament/initial-tournament';
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

@Component({
  selector: 'app-players',
  imports: [DeleteComponent, AddPlayerComponent],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnChanges {
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
  @Input() public participantId: number | null = null;
  @Input() public idTeam: number | null = null;
  @Input() public thereAreNotParticipants: boolean = false;
  @Input() public isGlobalTeam: boolean = false;
  @Input() public code: string = '';
  @Input() public nameTournament: string = '';
  protected isGlobalTeamPlayers: boolean = false;
  protected participantTeam: ParticipantResponse = INITIAL_PARTICIPANT;
  protected participantGlobalStats = {} as TeamWithAllStatsPlayerResponse;
  protected flagAddPlayer: boolean = false;
  protected playerDeleted: { idPlayer: number, idPlayerParticipant: number } = { idPlayer: 0, idPlayerParticipant: 0 };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['participantId'] || changes['isGlobalTeam'] || changes['idTeam']) && this.participantId !== null) {
      if (this.isGlobalTeam) {
        console.log('Obteniendo jugadores globales');
        if (this.idTeam) { this.getPlayersGlobal(this.idTeam); } else { console.error('No se ha proporcionado el id del equipo'); }
      } else {
        this.getPlayersParticipants(this.participantId);
      }
    }

    if (changes['idTeam'] && this.idTeam) this.loadTeamStatus(this.idTeam);

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

  getPlayersGlobal(idTeam: number) {
    this.teamService.getTeam(idTeam).subscribe({
      next: (response) => {
        if (response) {
          console.log('Equipo global obtenido:', response);
          this.mapPlayersGlobal(response);
        }
      },
      error: (error) => {
        console.error('Error al obtener los jugadores globales:', error);
      }
    });
  }

  getPlayersParticipants(idParticipant: number) {
    this.tournamentService.getTournamentParticipantTeamByID(idParticipant).subscribe({
      next: (response) => {
        if (!this.isGlobalTeam) {
          this.participantTeam = response;
          console.log('Jugadores participantes obtenidos:', this.participantTeam);
        }
      },
      error: (error) => {
        console.error('Error al obtener los jugadores del equipo participante', error);
      }
    });
  }


  deletePlayer(idPlayerGlobal: number) {
    this.playerDeleted = {
      idPlayer: idPlayerGlobal,
      idPlayerParticipant: this.participantTeam.playerParticipants.find(player => player.playerId === idPlayerGlobal)?.id || 0
    }

    if (this.isGlobalTeam) {
      this.participantGlobalStats.playerParticipants = this.participantGlobalStats.playerParticipants.filter(player => player.playerId !== idPlayerGlobal);
      console.log('Jugadores globales eliminados:', this.participantGlobalStats);
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


  mapPlayersGlobal(response: TeamResponse) {
    this.teamService.getAllStatsPlayersFromTeam(response.id).subscribe({
      next: (response) => {
        if (response) {
          this.participantGlobalStats = response;
        }
        console.log('Jugadores globales mapeados:', this.participantGlobalStats);
        console.log('es global team:', this.isGlobalTeam);
      },
      error: (error) => {
        console.error('Error al obtener las estadísticas de los jugadores del equipo', error);
      }


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
    console.log('Agregando jugador:', newPlayer);
    if (this.isGlobalTeam) {
      //antes de agregar
      console.log('Jugadores globales antes de agregar:', this.participantGlobalStats);
      this.participantGlobalStats.playerParticipants.push(newPlayer);
      console.log('Jugadores globales después de agregar:', this.participantGlobalStats);
    } else {
      console.log('Jugadores participantes antes de agregar:', this.participantTeam);
      this.participantTeam.playerParticipants.push(newPlayer);
    }
  }

  private loadTeamStatus(idTeam: number) {
    this.teamService.getTeam(idTeam).subscribe({ next: (t) => { if (t) { this.teamEnabled = t.status !== false; this.teamName = t.name; } }, error: () => {} });
  }

  private currentTeamId(): number | null {
    return this.idTeam || this.returnIfIsGlobalOrNot() || null;
  }

  /** Plan 22/10 #2: borra si nunca jugó; si jugó lo deshabilita (el diálogo dice cuál de las dos). */
  async deleteTeam() {
    const id = this.currentTeamId();
    if (!id) { this.alertService.errorAlert('No se ha seleccionado un equipo'); return; }
    const action = await this.teamRemoval.remove(id);
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
      console.log('Obteniendo ultimos partidos: ', this.participantTeam.idParticipant);
      console.log('Obteniendo ultimos partidos: ', this.code);
      this.tournamentService.getMatchesAllForParticipant(this.code, this.participantTeam.idParticipant).subscribe({
        next: (response: MatchResponse[]) => {
          console.log('Ultimos partidos:', response);
          this.tournamentService.setMatches(response);
          this.tournamentService.setNameTeamToViewEvents(this.participantTeam.name);
          this.dashboardService.setActiveDashboardAdminComponent('lasts-matches');
          sessionStorage.setItem('lastTournamentClickedName', this.nameTournament);
          this.alertService.closeLoadingAlert();
        }
      });
    } else {
      this.alertService.errorAlert('No se ha seleccionado un equipo');
    }
  }

}
