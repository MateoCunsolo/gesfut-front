import { roundLabel } from '../../../core/utils/round-label';
import { compareStandings } from '../../../core/utils/standings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchCardComponent } from '../../../shared/match-card/match-card.component';
import { MatchDayResponse, ParticipantResponse } from '../../../core/models/tournamentResponse';
import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { TournamentResponseFull } from '../../../core/models/tournamentResponse';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../../core/services/tournament/initial-tournament';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../../core/services/manager/session.service';
import { TimepickerDatepickerIntegrationExample } from "./timePicker/timePicker.component";
import { EventRequest, MatchDateResponse } from '../../../core/models/matchRequest';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { TeamResponse } from '../../../core/models/teamResponse';

@Component({
  selector: 'app-list-match-days',
  imports: [MatchCardComponent, CommonModule, TimepickerDatepickerIntegrationExample, FormsModule],
  templateUrl: './list-match-days.component.html',
  styleUrls: ['./list-match-days.component.scss']
})
export class ListMatchDaysComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  searchTeam(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    const qualifiedSet = new Set(this.teamsQualify.map(team => team.idParticipant));

    this.tournamentParticipantCopy = this.tournament.participants
      .filter(participant => !qualifiedSet.has(participant.idParticipant))
      .filter(participant => searchTerm ? participant.name.toLowerCase().includes(searchTerm) : true);
  }


  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;
  selectedMatchDay = 0;
  code: string | null = null;
  matchDayStatus: boolean = false;
  showPicker: boolean = false;
  selectedMatchId: number = 0;
  isForAllMatches: boolean = false;
  playersMvpS: string[] = ['Seleccionar MVP'];
  bindingSelect: number = 0;
  showGeneratePlayOffs: boolean = false;
  teamsQualify: ParticipantResponse[] = [];
  tournamentParticipantCopy: ParticipantResponse[] = [];
  constructor(
    private dashboardService: DashboardService,
    private tournamentService: TournamentService,
    private matchDaysService: MatchDaysService,
    private alertService: AlertService,
    private sessionService: SessionService
  ) { }

  /** Auditoria 22/10: el cruce se nombra por los equipos, no por IDs internos. */
  bracketRival(day: any, matchId: number): string {
    const m = day?.matches?.find((x: any) => x.id === matchId);
    return m && m.homeTeam && m.awayTeam ? `${m.homeTeam} – ${m.awayTeam}` : 'la otra llave';
  }

  ngOnInit(): void {
    this.tournamentService.currentTournament.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
    } else {
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

    if (!status) {
      if (this.tournament.matchDays[this.tournament.matchDays.length - 1].isPlayOff
        && (this.tournament.matchDays[this.tournament.matchDays.length - 1].matches.length == 1)
        && this.tournament.matchDays[this.selectedMatchDay].isPlayOff
        && this.tournament.matchDays[this.selectedMatchDay].isFinished
      ) {
        if (this.selectedMatchDay !== this.tournament.matchDays.length - 1) {
          this.alertService.infoAlertTop('Ya se ha generado la final.');
          return;
        }
      }
    }


    // Recorrido 22/10: el backend permite reabrir mientras no haya playoffs generados después de esta fecha.
    if (this.tournament.matchDays.some((day, i) => i > this.selectedMatchDay && day.isPlayOff)) {
      this.alertService.infoAlertTop('No se puede reabrir: ya hay playoffs generados después de esta fecha.');
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

  roundLabel = roundLabel;

  closeMatchDay(status: boolean, closeKind: 'fecha' | 'playoffs' | 'torneo' = 'fecha') {
    console.log('Iniciando la función closeMatchDay');

    this.playersMvpS = [];
    console.log('playersMvpS inicializado:', this.playersMvpS);

    if (this.selectedMatchDay != 0) {
      console.log('Verificando la fecha seleccionada:', this.selectedMatchDay);
      if (!this.tournament.matchDays[this.selectedMatchDay - 1].isFinished) {
        this.alertService.errorAlert('Primero debes finalizar la fecha anterior');
        console.log('No se ha finalizado la fecha anterior');
        return;
      }
    }

    const unfinishedMatch = this.tournament.matchDays[this.selectedMatchDay].matches.find(match => !match.isFinished);
    if (unfinishedMatch) {
      console.log('Partido no cerrado encontrado:', unfinishedMatch);
      if (unfinishedMatch.homeTeam.toLowerCase() === 'free' || unfinishedMatch.awayTeam.toLowerCase() === 'free') {
        unfinishedMatch.isFinished = true;
        console.log('Partido marcado como cerrado:', unfinishedMatch);
      } else {
        this.alertService.errorAlert('El partido: ' + unfinishedMatch.homeTeam + ' vs ' + unfinishedMatch.awayTeam + ' no fue cerrado.');
        console.log('El partido no se cerró correctamente:', unfinishedMatch.homeTeam, unfinishedMatch.awayTeam);
        return;
      }
    }

    //ADVERTIR QUE ES LA ULTIMA FECHA 
    if (this.selectedMatchDay === this.tournament.matchDays.length - 1 && !this.tournament.matchDays[this.selectedMatchDay].isFinished && !this.tournament.matchDays[this.selectedMatchDay].isPlayOff) {
      console.log('Última fecha del torneo, mostrando advertencia');
      this.alertService.confirmAlert('⚠️ ADVERTENCIA ⚠️', 'Es la última fecha de la fase regular. Al cerrarla el torneo queda finalizado; después podés generar playoffs, o reabrir la fecha si necesitás corregir algo mientras no haya playoffs.', 'Confirmar')
        .then((result) => {
          console.log('Resultado de la confirmación:', result);
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

    if (!this.tournament.matchDays[this.selectedMatchDay].isFinished && this.tournament.matchDays[this.selectedMatchDay].matches.some(match => match.mvpPlayer != null && match.mvpPlayer !== '')) {
      console.log('Cerrando fecha con MVP');
      this.closeMatchDayWithMvp(status);
    } else {
      // Recorrido 22/10: confirmar también el cierre sin MVP.
      const copy = closeKind === 'torneo'
        ? { title: '¿Cerrar el torneo?', text: 'El torneo quedará finalizado. Ningún partido tiene MVP elegido.', button: 'Cerrar torneo' }
        : closeKind === 'playoffs'
          ? { title: '¿Cerrar esta instancia de playoffs?', text: 'Ningún partido tiene MVP elegido. Después podés generar la siguiente instancia.', button: 'Cerrar playoffs' }
          : { title: '¿Cerrar la fecha?', text: 'Ningún partido tiene MVP elegido, así que la fecha se cerrará sin jugador de la fecha.', button: 'Cerrar fecha' };
      this.alertService.confirmAlert(copy.title, copy.text, copy.button)
        .then((result) => { if (result.isConfirmed) this.openMatchDay(status); });
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
    this.playersMvpS = ['Seleccionar MVP'];
    this.tournament.matchDays[this.selectedMatchDay].matches.forEach((match) => {
      if (match.mvpPlayer != null && match.mvpPlayer !== '') {
        this.playersMvpS.push(match.mvpPlayer);
      }
    });
    console.log('playersMvpS:', this.playersMvpS);
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
    if (this.tournament.isFinished) {
      this.alertService.infoAlertTop('El torneo ya ha finalizado.');
      return;
    }
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

  cancel() {
    this.showGeneratePlayOffs = false;
    this.teamsQualify = [];
    this.tournamentParticipantCopy = [];
  }

  generatePlayOffs() {
    let length = this.teamsQualify.length;

    if (length === 0) {
      this.alertService.errorAlert('No hay equipos clasificados');
      return;
    }
    //multiple de 2
    if (!(length > 0 && (length & (length - 1)) === 0)) {
      this.alertService.errorAlert('El valor debe ser una potencia de 2');
      return;
    }

    const teamsIds = this.teamsQualify.map((team) => team.idParticipant);
    this.alertService.loadingAlert('Generando playoffs...');
    this.tournamentService.generatePlayOffs(teamsIds, this.tournament.code).subscribe({
      next: () => {
        this.alertService.successAlert("Playoffs generados correctamente");
        this.showGeneratePlayOffs = false;
        this.teamsQualify = [];
        this.matchDayStatus = false;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.errorAlert(error.error.error);
      }
    });

    this.alertService.successAlert("Playoffs primer vez generados correctamente");
    this.showGeneratePlayOffs = false;
    this.teamsQualify = [];
    //TODO: Implementar la generación de los playoffs
  }

  showGeneratePlayOffsFunction() {
    this.tournamentParticipantCopy = [...this.tournament.participants]
    this.orderTeamNoQualify();
    this.showGeneratePlayOffs = !this.showGeneratePlayOffs;
  }

  addTeamQualify(team: ParticipantResponse) {
    this.teamsQualify.push(team);
    this.tournamentParticipantCopy = this.tournamentParticipantCopy.filter(participant => participant.idParticipant !== team.idParticipant);
    this.orderTeamNoQualify();
    this.orderTeamQulify();
  }

  deleteTeamQualify(team: ParticipantResponse) {
    this.teamsQualify = this.teamsQualify.filter(participant => participant.idParticipant !== team.idParticipant);
    this.tournamentParticipantCopy.push(team);
    this.orderTeamNoQualify();
    this.orderTeamQulify();
  }

  addTeamsPerTable() {
    this.alertService.inputAlert('NUMERO DE EQUIPOS QUE CLASIFICARAN')
      .then((result) => {
        if (result.isConfirmed) {
          if (result.value) {
            if (this.checkValueInputAlertTeam(result.value)) {
              this.getBestTeamsLeaderboard(Number(result.value));
            }
          } else {
            this.alertService.errorAlert('El campo no puede estar vacío');
          }
        }
      });
  }

  checkValueInputAlertTeam(value: string): boolean {
    const num = Number(value);
    if (num < 2) {
      this.alertService.errorAlert('El valor debe ser mayor a 1');
      return false;
    }

    if (num > this.tournament.participants.length) {
      this.alertService.errorAlert('No hay esa cantidad de equipos en el torneo');
      return false;
    }

    if (num > 0 && (num & (num - 1)) === 0) {
      return true;
    } else {
      this.alertService.errorAlert('El valor debe ser una potencia de 2');
      return false;
    }
  }

  getBestTeamsLeaderboard(numTeams: number) {
    this.teamsQualify = [];
    this.tournamentParticipantCopy = [...this.tournament.participants];
    this.orderTeamNoQualify();
    this.teamsQualify = this.tournamentParticipantCopy.slice(0, numTeams);
    this.tournamentParticipantCopy = this.tournamentParticipantCopy.slice(numTeams);
    this.tournamentParticipantCopy.sort((a, b) => compareStandings(a.statistics, b.statistics));
  };

  orderTeamQulify() {
    this.teamsQualify.sort((a, b) => compareStandings(a.statistics, b.statistics));
  }

  orderTeamNoQualify() {
    this.tournamentParticipantCopy.sort((a, b) => compareStandings(a.statistics, b.statistics));
  }

  generatePlayOffsNoTeams() {
    this.tournamentService.generatePlayOffs([], this.tournament.code).subscribe({
      next: () => {
        this.alertService.successAlert("Playoffs generados correctamente");
        this.showGeneratePlayOffs = false;
        this.teamsQualify = [];
        this.tournamentParticipantCopy = [];
        this.matchDayStatus = false;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.errorAlert(error.error.error);
      }
    });
  }


  async closeAllMatches() {
    for (let i = 0; i < this.tournament.matchDays.length; i++) {
      const promises = this.tournament.matchDays[i].matches.map((match) =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            this.matchDaysService.saveEvents([], match.id);
            resolve();
          }, 1500);
        })
      );

      await Promise.all(promises);
      this.closeMatchDay(true);
    }
  }


}
