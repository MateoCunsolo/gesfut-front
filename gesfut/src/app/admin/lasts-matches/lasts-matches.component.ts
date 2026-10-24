import { isByeMatch } from '../../core/utils/bye';
import { roundLabelForMatchDay } from '../../core/utils/round-label';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchCardComponent } from '../../shared/match-card/match-card.component';
import { Component, inject, DestroyRef } from '@angular/core';
import { MatchResponse } from '../../core/models/tournamentResponse';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/manager/auth.service';
import { GuestService } from '../../core/services/guest/guest.service';
import { MatchDaysService } from '../../core/services/tournament/match-days.service';
import { ListEventsComponent } from '../list-events/list-events.component';
import { AlertService } from '../../core/services/alert.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';

@Component({
  selector: 'app-lasts-matches',
  imports: [MatchCardComponent],
  templateUrl: './lasts-matches.component.html',
  styleUrl: './lasts-matches.component.scss',
})
export class LastsMatchesComponent {
  roundOf(n: number): string { return roundLabelForMatchDay(n, this.tournamentServices.currentTournament.value?.matchDays); }
  private readonly destroyRef = inject(DestroyRef);
  matches: MatchResponse[] = [];
  matchIndex: number = 0;
  teamName: string = '';
  viewEventsFlag: boolean = false;

  private route = inject(Router);
  private dashboardService = inject(DashboardService);
  private tournamentServices = inject(TournamentService);
  private guestService = inject(GuestService);
  private alertService = inject(AlertService);
  protected isGlobal:boolean = true;
  protected nameTeam:string = '';
  /** Filtro local Jugados / Próximos (por defecto, jugados más recientes primero). */
  filter: 'played' | 'upcoming' = 'played';
  get played(): MatchResponse[] { return this.matches.filter(m => m.isFinished && !this.isByeMatch(m)).slice().reverse(); }
  get upcoming(): MatchResponse[] { return this.matches.filter(m => !m.isFinished && !this.isByeMatch(m)); }
  /** Cabecera: equipo y torneo por separado (antes "EQUIPO EN TORNEO"). */
  get teamLabel(): string { return this.nameTeam || this.teamName; }
  get tournamentLabel(): string { return this.nameTeam ? (sessionStorage.getItem('viewingTournamentName') || '') : ''; }
  private isByeMatch(m: MatchResponse): boolean { return isByeMatch(m); }
  ngOnInit() {

    this.tournamentServices.$teamName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(this.route.url.includes('tournaments/')){
          this.teamName = response;
          this.isGlobal = false;
        }else if (this.route.url.includes('admin')) {
          this.nameTeam = response;
          this.teamName = response +' EN '+ sessionStorage.getItem('viewingTournamentName');
        }else{
          this.teamName = response;
        }
      },
    });


    this.tournamentServices.$matches.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.matches = response;
        this.matches.sort((a: MatchResponse, b: MatchResponse) => {
          return a.numberOfMatchDay - b.numberOfMatchDay;
        });
      },
    });
  }

  viewEvents(index: number): void {
    if(this.matches[index].isFinished === false) {
      this.alertService.errorAlert('El partido todavia no se ha jugado');
      return;
    }
    if (this.viewEventsFlag && this.matchIndex === index) {
      this.viewEventsFlag = false;
    } else {
      this.matchIndex = index;
      this.viewEventsFlag = true;
    }
  }

  back(): void {
    this.dashboardService.setActiveDashboardAdminComponent('list-teams');
    this.dashboardService.setActiveTournamentComponent('list-teams-tournament');
    this.guestService.setActiveComponent('list-teams-tournament');
  }

  someIsFree(index:number): boolean {
    if(isByeMatch(this.matches[index])) {
      return true;
    }
    return false;
  }
}
