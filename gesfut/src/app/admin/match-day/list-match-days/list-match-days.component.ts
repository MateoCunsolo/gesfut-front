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

@Component({
  selector: 'app-list-match-days',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-match-days.component.html',
  styleUrls: ['./list-match-days.component.scss'],
})
export class ListMatchDaysComponent implements OnInit {
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  selectedMatchDay = 0;
  code: string | null = null;
  matchDayStatus: boolean = false;

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

  async editDateAndDescription(matchId:number){
    const result = await this.alertService.EditDateAndDescriptionMatchAlert();

    const selectedDate: string = result.value.date;  // Asumo que esto es un string en formato 'yyyy-mm-dd'
    const selectedTime: string = result.value.time;  // Asumo que esto es un string en formato 'HH:mm'

    // Concatenamos la fecha y la hora para crear un string de fecha y hora completo
    const dateTimeString = `${selectedDate}T${selectedTime}:00`; // Ejemplo: "2025-02-05T23:00:00"

    // Convertimos ese string en un objeto Date
    const date = new Date(dateTimeString);  // Esto creará una fecha válida

    // Convertimos el objeto Date a formato ISO 8601 (esto también incluirá el 'Z' para UTC)
    const isoDateTime = date.toISOString();  // Esto dará formato como "2025-02-05T23:00:00.000Z"

    const request: UpdateDateAndDescriptionRequest = {
      description: result.value.description,
      localDateTime: isoDateTime // Pasamos la fecha en formato ISO 8601
    };

    if (result.isConfirmed) {
      console.log("Fecha y hora seleccionadas:", isoDateTime);
      console.log("Descripción:", result.value.description);

      this.matchDaysService.updateDateAndDescriptionMatch(matchId, request).subscribe({
        next: () => {
          this.alertService.successAlert("Fecha y hora modificadas.");
        },
        error: (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
          this.alertService.errorAlert(errorResponse.error.error);
        }
      });
    }
  }

}
