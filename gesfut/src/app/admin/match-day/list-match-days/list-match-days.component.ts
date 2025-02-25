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
import { TimepickerDatepickerIntegrationExample } from "./timePicker/timePicker.component";
import { MatchDateResponse } from '../../../core/models/matchRequest';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-match-days',
  imports: [CommonModule, TimepickerDatepickerIntegrationExample, FormsModule],
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
  isForAllMatches: boolean = false;
  playersMvpS: string[] = ['Seleccionar MVP'];
  bindingSelect: number = 0;
  constructor(
    private dashboardService: DashboardService,
    private tournamentService: TournamentService,
    private matchDaysService: MatchDaysService,
    private alertService: AlertService,
    private sessionService: SessionService
  ) { }

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
        this.selectedMatchDay = lastFinishedMatchDay ? lastFinishedMatchDay.numberOfMatchDay + 1 : 0;
        this.bindingSelect = this.selectedMatchDay;
        if (this.selectedMatchDay === this.tournament.matchDays.length) {
          this.selectedMatchDay = this.tournament.matchDays.length - 1;
          this.bindingSelect = this.selectedMatchDay;
          this.matchDayStatus = this.tournament.matchDays[this.selectedMatchDay].isFinished;
        }
        this.sortMatchDays();
        this.orderForDateMatchDay();
      },
    });
  }

  updateMatchDay(matchDay: number | Event) {
    if (typeof matchDay === 'number') {
      this.selectedMatchDay = matchDay;
      this.bindingSelect = this.selectedMatchDay;
    }else{
      this.selectedMatchDay = parseInt((<HTMLInputElement>matchDay.target).value)
      this.bindingSelect = this.selectedMatchDay;
    }
    this.matchDayStatus =
      this.tournament.matchDays[this.selectedMatchDay].isFinished;
    console.log(this.tournament.matchDays[this.selectedMatchDay].isFinished)
    this.orderForDateMatchDay();
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
    if (this.matchDaysService.previusMatchDayIsFinished(this.tournament.matchDays[this.selectedMatchDay])) {
      this.matchDaysService.setActiveMatch(matchId);
    } else {
      this.alertService.errorAlert('Primero debes finalizar la fecha anterior');
    }
  }

  async toggleMatchDayStatus(status: boolean) {
    if (this.tournament.isFinished) {
      this.alertService.infoAlertTop('El torneo ya ha finalizado.');
      return;
    }
    this.alertService
      .confirmAlert(
        '¿Estás seguro?',
        'Reabrir la fecha te permitirá modificar los resultados.',
        'Confirmar'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.closeMatchDay(status);
        }
      });
  }

  closeMatchDay(status: boolean) {
    this.playersMvpS = [];
    this.playersMvpS.push('Seleccionar MVP');

    if(this.selectedMatchDay != 0){
      if(!this.tournament.matchDays[this.selectedMatchDay-1].isFinished){
        this.alertService.errorAlert('Primero debes finalizar la fecha anterior');
        return;
      }
    }
   
    if (this.tournament.matchDays[this.selectedMatchDay].matches.some(match => !match.isFinished)) {
      const match = this.tournament.matchDays[this.selectedMatchDay].matches.find(match => !match.isFinished);
      if (match?.homeTeam.toLowerCase() === 'free' || match?.awayTeam.toLowerCase() === 'free') {
        match.isFinished = true;
      }else{
        this.alertService.errorAlert('El partido: '+ match?.homeTeam + ' vs ' + match?.awayTeam + ' no fue cerrado.');
      }
      return;
    }

    //ADVERTIR QUE ES LA ULTIMA FECHA 
    if (this.selectedMatchDay === this.tournament.matchDays.length - 1 && !this.tournament.matchDays[this.selectedMatchDay].isFinished) {
      this.alertService.confirmAlert('⚠️ ADVERTENCIA ⚠️', 'Esta es la última fecha del torneo, al cerrarla se dara por terminado el torneo y no se podra volver a abrir.', 'Confirmar')
        .then((result) => {
          if (result.isConfirmed) {
            if (!this.tournament.matchDays[this.selectedMatchDay].isFinished && this.tournament.matchDays[this.selectedMatchDay].matches.some(match => match.mvpPlayer != null)) {
              this.closeMatchDayWithMvp(status);
            } else {
              this.openMatchDay(status);
            }
          }
        });
      return;
    }

    if (!this.tournament.matchDays[this.selectedMatchDay].isFinished && this.tournament.matchDays[this.selectedMatchDay].matches.some(match => match.mvpPlayer != null)) {
      this.closeMatchDayWithMvp(status);
    } else {
      this.openMatchDay(status);
    }
  }


  openMatchDay(status: boolean) {
    this.matchDaysService
      .closeMatchDay(this.tournament.matchDays[this.selectedMatchDay].idMatchDay, status, '')
      .subscribe({
        next: () => {
          this.alertService.successAlert(status ? 'Fecha cerrada!' : 'Fecha abierta!');
          this.matchDayStatus = false;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.alertService.errorAlert(errorResponse.error.error);
        }
      });
  }


  closeMatchDayWithMvp(status: boolean) {
    let playerMvp = '';
    this.tournament.matchDays[this.selectedMatchDay].matches.forEach((match) => {
      if (match.mvpPlayer != null) {
        this.playersMvpS.push(match.mvpPlayer);
      }
    });
    this.alertService.selectOptionsAlert('SELECCIONE EL MVP DE LA FECHA', this.playersMvpS, "CERRAR SIN MVP")
    .then((result) => {
      if (result.isConfirmed && result.value !== undefined) {
        const playerMvp = this.playersMvpS[result.value];
        if (playerMvp && playerMvp !== 'Seleccionar MVP') {
          this.matchDaysService
            .closeMatchDay(this.tournament.matchDays[this.selectedMatchDay].idMatchDay, status, playerMvp)
            .subscribe({
              next: () => {
                this.alertService.successAlert(status ? 'Fecha cerrada!' : 'Fecha abierta!');
                this.matchDayStatus = false;
              },
              error: (errorResponse: HttpErrorResponse) => {
                this.alertService.errorAlert(errorResponse.error.error);
              }
            });
        } else {
          this.alertService.errorAlert('Debe seleccionar un MVP');
        }
      } else if (result.dismiss === Swal.DismissReason.backdrop) {
        return;
      } else {
        this.openMatchDay(status);
      }
    });
  }  



  editResult(id: number) {
    this.matchDaysService.setEditResult(true);
    this.matchDaysService.setActiveMatch(id);
  }

  isAuth(): boolean {
    return this.sessionService.isAuth();
  }

  cancelPicker(flag: Boolean) {
    this.showPicker = false;
  }

  sendMatchId(id: number, option: number) {
    switch (option) {
      //caso 1: Editar fecha
      case 1:
        this.isForAllMatches = false;
        this.editDate(id);
        break;
      //caso 2: Editar descripción (complejo)
      case 2:
        this.editDescription(id);
        break;
    }


  }


  editDate(id: number) {
    this.showPicker = true;
    this.selectedMatchId = id;
  }

  async editDescription(id: number) {
    ///TODO: Implementar la edición de la descripción
    let description = await this.alertService.updateNumberInputAlert("Ingrese la nueva descripción");
    if (description != null) {
      let descripciónString = description.toString();
      this.matchDaysService.updateDescriptionMatch(descripciónString, id).subscribe({
        next: () => {
          this.alertService.successAlert("Descripción actualizada.");

          let matchFound = this.tournament.matchDays[this.selectedMatchDay].matches.find(
            (match) => match.id === id
          )

          if (matchFound) {
            matchFound.description = descripciónString;
          } else {
            this.alertService.errorAlert('No se encontró el partido seleccionado');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.alertService.errorAlert(error.error.error)
        }
      })
    }
  }


  updateAllDates(data: MatchDateResponse[]) {
    this.tournament.matchDays[this.selectedMatchDay].matches.forEach((match, index) => {
      if (match.id !== 0) {
        match.dateTime = data[index].newDate;
      }
    })
  }


  updateDateTime(date: string) {
    console.log('Fecha recibida en el componente:', date);

    if (!date) {  // También cubre el caso de `null`
      this.alertService.errorAlert('Debe seleccionar una fecha y hora válida');
      return;
    }


    let matchFound = this.tournament.matchDays[this.selectedMatchDay].matches.find(
      (match) => match.id === this.selectedMatchId
    )

    if (matchFound) {
      matchFound.dateTime = date;
    } else {
      this.alertService.errorAlert('No se encontró el partido seleccionado');
    }

  }

  chargeAllDates() {
    this.isForAllMatches = true;
    this.showPicker = true;
    this.selectedMatchId = 0;
  }

  orderForDateMatchDay() {
    if (this.tournament.matchDays[this.selectedMatchDay].matches[0].dateTime) {
      this.tournament.matchDays[this.selectedMatchDay].matches.sort((a, b) => {
        if (a.homeTeam.toLocaleLowerCase() === 'free' || a.awayTeam.toLocaleLowerCase() === 'free') {
          return 1;
        }
        if (this.returnHour(a.dateTime) > this.returnHour(b.dateTime)) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }

  returnHour(dateTime: string) {
    const dateTimeString = dateTime;
    const time = dateTimeString.split('|')[1].trim().split(' ')[0];
    return time;
  }

  someMatchIsClosed() {
    return this.tournament.matchDays[this.selectedMatchDay].matches.some((match) => match.isFinished);
  }

}
