import { matchesSearch, reconcileSelection } from '../../core/utils/team-selection';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, DestroyRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ParticipantResponse, TournamentResponseFull } from '../../core/models/tournamentResponse';
import { emptyParticipant, INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { NamesTournamentsComponent } from '../list-teams/components/names-tournaments/names-tournaments.component';
import { PlayersComponent } from '../list-teams/components/players/players.component';
import { PlayersTournamentComponent } from './players-tournament/players-tournament.component';
import { TeamService } from '../../core/services/tournament/team.service';
import { SessionService } from '../../core/services/manager/session.service';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-list-team-tournaments',
  imports: [CommonModule, FormsModule, PlayersTournamentComponent],
  templateUrl: './list-teams-tournaments.component.html',
  styleUrl: './list-teams-tournaments.component.scss'
})
export class ListTeamsTournamentsComponent {
  private readonly destroyRef = inject(DestroyRef);

  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);
  private sessionService = inject(SessionService);

  protected tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  protected participants: ParticipantResponse[] = [];
  protected particpantsFilter: ParticipantResponse[] = [];
  protected teamParticipant: ParticipantResponse = emptyParticipant();
  protected nameClicked: string = '';
  protected indexSelectedAfter = 0;
  protected inputText: string = '';
  protected lastClicked: number = 0;
  protected bindingSelect: number = 0;
  protected colorSelected: string = '';
  protected selectionLost = false;
  constructor() { }

  ngOnInit() {
    this.tournamentService.currentTournament.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.tournament = response;
        this.participants = response.participants;
        this.particpantsFilter = this.participants.filter(team => matchesSearch(team.name, this.inputText));
        const keepId = this.teamParticipant?.idParticipant;
        const retained = this.participants.find(p => keepId && p.idParticipant === keepId);
        if (keepId && !retained) this.selectionLost = true;
        const next = retained || (!this.selectionLost ? this.particpantsFilter[this.lastClicked] || this.particpantsFilter[0] : undefined);
        if (next && this.particpantsFilter.some(p => p.idParticipant === next.idParticipant)) {
          this.selectParticipant(next);
        } else {
          this.teamParticipant = emptyParticipant();
          this.bindingSelect = 0;
          this.nameClicked = '';
          this.colorSelected = '';
          this.indexSelectedAfter = -1;
        }

      },
      error: (error) => {
      }
    });

    this.tournamentService.getLastTeamClicked().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.lastClicked = response;
        if (this.participants.length > 0 && !this.selectionLost) {
          const next = this.particpantsFilter.find(p => p.idParticipant === this.teamParticipant.idParticipant) || this.particpantsFilter[this.lastClicked] || this.particpantsFilter[0];
          if (next) this.selectParticipant(next);
        }
      },
      error: (error) => {
      }
    });
  }

  searchTeams($event: Event) {
    this.inputText = ($event.target as HTMLInputElement).value.trim().toLowerCase();
    this.particpantsFilter = this.participants.filter(team => matchesSearch(team.name, this.inputText));
    // Retest 24/10: el detalle siempre es de un equipo visible (o ninguno), igual que en Mis equipos.
    const next = reconcileSelection(this.particpantsFilter.map(p => ({ id: p.idParticipant })), this.teamParticipant?.idParticipant);
    if (!this.selectionLost && next && next !== this.teamParticipant?.idParticipant) this.showParticipants(next);
    this.updateSelectedIndex();
  }

  /** Sin resultados en la busqueda no se muestra (ni se puede accionar sobre) el equipo anterior. */
  get noResults(): boolean { return this.particpantsFilter.length === 0; }

  private updateSelectedIndex() {
    if (this.teamParticipant) {
      this.indexSelectedAfter = this.particpantsFilter.findIndex(
        team => team.idParticipant === this.teamParticipant.idParticipant
      );
    } else {
      this.indexSelectedAfter = -1;
    }
  }

  private selectParticipant(participant: ParticipantResponse) {
    this.teamParticipant = participant;
    this.nameClicked = participant.name;
    this.bindingSelect = participant.idParticipant;
    this.colorSelected = participant.color || '';
    this.updateSelectedIndex();
    if (!participant.color && this.sessionService.isAuth()) this.getTeamColor(participant.idTeam);
  }

  showParticipants(idParticipant: number) {
    const participant = this.particpantsFilter.find(p => p.idParticipant === idParticipant);
    if (participant) {
      this.selectionLost = false;
      this.selectParticipant(participant);
      this.tournamentService.setLastTeamClicked(this.participants.indexOf(participant));
    }
  }


  // Loop 3/4: el color sale del cache de TeamService (una sola request, se invalida al editar el equipo).
  getTeamColor(idTeam: number) {
    this.teamService.getTeamColor(idTeam).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (color) => {
        if (this.teamParticipant.idTeam === idTeam) this.colorSelected = color;
      },
      error: (error) => {
      }
    })
  }


  showParticipantsFromOptional(idParticipant: Event) {
    let idParticipantValue = (idParticipant.target as HTMLInputElement).value;
    if (parseInt(idParticipantValue) === 0) {
      this.showParticipants(this.teamParticipant.idParticipant);
    } else {
      this.showParticipants(parseInt(idParticipantValue));
    }
  }

}

