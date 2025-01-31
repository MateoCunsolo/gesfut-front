import { MatchDayResponse } from '../../../core/models/tournamentResponse';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TournamentResponseFull } from '../../../core/models/tournamentResponse';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../../core/services/tournament/initial-tournament';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../../core/services/manager/session.service';
import { UpdateDateAndDescriptionRequest } from '../../../core/models/UpdateDateAndDescriptionRequest';
import { TimepickerDatepickerIntegrationExample } from "./timePicker/timePicker.component";

@Component({
    selector: 'app-list-match-days',
    imports: [CommonModule, TimepickerDatepickerIntegrationExample],
    templateUrl: './list-match-days.component.html',
    styleUrls: ['./list-match-days.component.scss']
})
export class ListMatchDaysComponent implements OnInit {
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  selectedMatchDay = 0;
  code: string | null = null;
  matchDayStatus: boolean = false;
  showPicker: boolean = false;
  selectedMatchId: number = 0;
  constructor(
    private dashboardService: DashboardService,
    private tournamentService: TournamentService,
    private matchDaysService: MatchDaysService,
    private alertService: AlertService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.tournamentService.currentTournament.subscribe({
      next: (response: TournamentResponseFull) => {
        this.tournament = response;
        const lastFinishedMatchDay = this.tournament.matchDays
          .filter((matchday: MatchDayResponse) => matchday.isFinished)
          .reduce((max: MatchDayResponse | undefined, matchday: MatchDayResponse) =>
            !max || matchday.numberOfMatchDay > max.numberOfMatchDay ? matchday : max,
            undefined
          );
        this.selectedMatchDay = lastFinishedMatchDay ? lastFinishedMatchDay.numberOfMatchDay+1: 0;
        this.sortMatchDays();
      },
    });
  }

  updateMatchDay(matchDay: number) {
    this.selectedMatchDay = matchDay;
    this.matchDayStatus =
      this.tournament.matchDays[this.selectedMatchDay].isFinished;
      console.log(this.tournament.matchDays[this.selectedMatchDay].isFinished)
  }

  private sortMatchDays(): void {
    if (this.tournament?.matchDays) {
      this.tournament.matchDays.sort(
        (a, b) => a.numberOfMatchDay - b.numberOfMatchDay
      );
    }
  }

  changeComponent(component: string) {
    this.dashboardService.setActiveTournamentComponent(component);
  }

  loadResult(matchId: number) {
    this.matchDaysService.setActiveMatch(matchId);
    this.dashboardService.setActiveTournamentComponent('load-result');
  }

  async toggleMatchDayStatus(status: boolean) {
    this.alertService
      .confirmAlert(
        '¿Estás seguro?',
        'Esta acción no se puede deshacer',
        'Confirmar'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.closeMatchDay(status);
        }
      });
  }

  closeMatchDay(status: boolean) {
    this.matchDaysService
      .closeMatchDay(
        this.tournament.matchDays[this.selectedMatchDay].idMatchDay,
        status
      )
      .subscribe({
        next: () => {
          if (status === true) this.alertService.successAlert('Fecha cerrada!');
          if (status === false)
            this.alertService.successAlert('Fecha abierta!');
          this.matchDayStatus = !status;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.alertService.errorAlert(errorResponse.error.error);
        },
      });
  }

  editResult(id: number) {
    this.matchDaysService.setEditResult(true);
    this.matchDaysService.setActiveMatch(id);
    this.dashboardService.setActiveTournamentComponent('load-result');
  }

  isAuth(): boolean {
    return this.sessionService.isAuth();
  }

  cancelPicker(flag:Boolean){
    this.showPicker = false;
  }

  sendMatchId(id:number, option: number){
    switch(option){
      //caso 1: Editar fecha
      case 1:
        this.editDate(id);
        break;
      //caso 2: Editar descripción (complejo)
      case 2:
        this.editDescription(id);
        break;
    }

    
  }


  editDate(id: number){
    this.showPicker = true;
    this.selectedMatchId = id;
  }

  editDescription(id: number){
    ///TODO: Implementar la edición de la descripción
    this.alertService.infoAlertTop('Función no implementada');
  }




  updateDateTime(date: String) {
    console.log('Fecha recibida en el componente:', date);
  
    if (!date) {  // También cubre el caso de `null`
      this.alertService.errorAlert('Debe seleccionar una fecha y hora válida');
      return;
    }
    

    let matchFound = this.tournament.matchDays[this.selectedMatchDay].matches.find(
      (match) => match.id === this.selectedMatchId
    )

    if(matchFound){
      matchFound.dateTime = date;
    }else{
      this.alertService.errorAlert('No se encontró el partido seleccionado');
    }
    
  }
  

}
