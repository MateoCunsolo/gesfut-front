import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, DestroyRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { ParticipantResponse, TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_PARTICIPANT, INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
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
  protected teamParticipant: ParticipantResponse = INITIAL_PARTICIPANT;
  protected nameClicked: string = '';
  protected indexSelectedAfter = 0;
  protected inputText: string = '';
  protected lastClicked: number = 0;
  protected bindingSelect: number = 0;
  protected colorSelected: string = '';
  constructor() { }

  ngOnInit() {
    this.tournamentService.currentTournament.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.tournament = response;
        this.participants = response.participants;
        this.particpantsFilter = response.participants;

        if (this.participants.length > 0) {
          this.teamParticipant = this.participants[this.lastClicked] || this.participants[0];
          this.bindingSelect = this.teamParticipant.idParticipant;
          this.nameClicked = this.teamParticipant.name;
          this.getTeamColor(this.teamParticipant.idTeam);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });

    this.tournamentService.getLastTeamClicked().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.lastClicked = response;
        if (this.participants.length > 0) {
          this.teamParticipant = this.participants[this.lastClicked] || this.participants[0];
          this.bindingSelect = this.teamParticipant.idParticipant;
          this.nameClicked = this.teamParticipant.name;
          this.getTeamColor(this.teamParticipant.idTeam);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  searchTeams($event: Event) {
    this.inputText = ($event.target as HTMLInputElement).value.toLowerCase();
    this.particpantsFilter = this.participants.filter(team =>
      team.name.toLowerCase().includes(this.inputText)
    );
    this.updateSelectedIndex();
  }

  private updateSelectedIndex() {
    if (this.teamParticipant) {
      this.indexSelectedAfter = this.particpantsFilter.findIndex(
        team => team.idParticipant === this.teamParticipant.idParticipant
      );
    } else {
      this.indexSelectedAfter = -1;
    }
  }

  showParticipants(idParticipant: number) {
    const participant = this.participants.find(p => p.idParticipant === idParticipant);
    if (participant) {
      this.nameClicked = participant.name;
      this.teamParticipant = participant;
      this.tournamentService.setLastTeamClicked(this.participants.indexOf(participant));
      this.updateSelectedIndex();
      this.bindingSelect = idParticipant;
      // Revisión crítica #14: el color viene en el participante (la vista pública no puede pedir /teams/{id}).
      if (participant.color) this.colorSelected = participant.color;
      else if (this.sessionService.isAuth()) this.getTeamColor(participant.idTeam);
    }
  }

  // Loop 3/4: el color sale del cache de TeamService (una sola request, se invalida al editar el equipo).
  getTeamColor(idTeam: number) {
    this.teamService.getTeamColor(idTeam).subscribe({
      next: (color) => {
        this.colorSelected = color;
      },
      error: (error) => {
        console.error(error);
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

