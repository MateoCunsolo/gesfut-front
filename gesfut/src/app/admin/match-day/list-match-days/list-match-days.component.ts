import { MatchResponse } from '../../../core/models/tournamentResponse';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TournamentResponseFull } from '../../../core/models/tournamentResponse';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../../core/services/tournament/initial-tournament';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-list-match-days',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-match-days.component.html',
  styleUrls: ['./list-match-days.component.scss']
})
export class ListMatchDaysComponent implements OnInit{
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  selectedMatchDay = 0;
  code: string | null = null;
  matchDayStatus:boolean = false;

  constructor(
    private dashboardService:DashboardService,
    private tournamentService:TournamentService,
    private matchDaysService:MatchDaysService,
    private alertService:AlertService
  ) {}

  ngOnInit(): void {
    this.tournamentService.currentTournament.subscribe({
      next: (response:TournamentResponseFull) =>{
        this.tournament = response;
        this.matchDayStatus = this.tournament.matchDays[this.selectedMatchDay].isFinished;
        this.sortMatchDays();
      }
    })
  }

  updateMatchDay(matchDay: number) {
    this.selectedMatchDay = matchDay;
    this.matchDayStatus = this.tournament.matchDays[this.selectedMatchDay].isFinished;
  }

  private sortMatchDays(): void {
    if (this.tournament?.matchDays) {
      this.tournament.matchDays.sort((a, b) => a.numberOfMatchDay - b.numberOfMatchDay);
    }
  }

  changeComponent(component:string){
    this.dashboardService.setActiveTournamentComponent(component);
  }

  loadResult(matchId: number) {
    this.matchDaysService.setActiveMatch(matchId);
    this.dashboardService.setActiveTournamentComponent('load-result');
  }

  async toggleMatchDayStatus(status: boolean) {
    this.alertService.confirmAlert('¿Estás seguro?', 'Esta acción no se puede deshacer', 'Confirmar').then((result) => {
      if (result.isConfirmed) {
        this.closeMatchDay(status);
      }
    });    
  }

  closeMatchDay(status: boolean){
    this.matchDaysService.closeMatchDay(this.tournament.matchDays[this.selectedMatchDay].idMatchDay, status).subscribe({
      next: () => {
        if(status===true) this.alertService.successAlert('Fecha cerrada!');
        if(status===false) this.alertService.successAlert('Fecha abierta!');
        this.matchDayStatus = !status;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.alertService.errorAlert(errorResponse.error.error);
      }
    });
  }
  

  editResult(id: number) {
    this.matchDaysService.setEditResult(true);
    this.matchDaysService.setActiveMatch(id);
    this.dashboardService.setActiveTournamentComponent('load-result');
  }
}
