import { mvpCandidates } from '../../../core/utils/mvp';
import { addTeamMode, AddTeamMode } from '../../../core/utils/add-team';
import { AdminService } from '../../../core/services/manager/admin.service';
import { canFinish } from '../../../core/utils/tournament-finish';
import { isByeMatch, playoffEligible } from '../../../core/utils/bye';
import { MatchResponse } from '../../../core/models/tournamentResponse';
import { httpErrorMessage } from '../../../core/utils/http-error';
import { roundLabel } from '../../../core/utils/round-label';
import { byLeagueRank } from '../../../core/utils/standings';
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
  /** Plan 22/10 #2: fecha libre (rival "Free" o dado de baja). */
  isBye(match: MatchResponse): boolean { return isByeMatch(match); }
  /** Revisión crítica #2: se puede finalizar cuando todo está jugado (liga y playoffs). */
  get canFinishTournament(): boolean { return canFinish(this.tournament); }
  /** Respuesta 3: "Sumar equipo" solo cuando el backend lo permite. */
  get addTeamMode(): AddTeamMode { return addTeamMode(this.tournament as any); }

  addTeamToTournament() {
    const mode = this.addTeamMode;
    if (!mode) return;
    const inTournament = new Set(this.tournament.participants.map(p => p.idTeam));
    this.adminService.getTeams().subscribe({
      next: async (teams) => {
        const options = teams.filter(t => t.status !== false && !inTournament.has(t.id));
        if (!options.length) { this.alertService.errorAlert('No tenés equipos habilitados que no estén en este torneo.'); return; }
        const text = mode === 'replace-free'
          ? 'El torneo ya empezó: el equipo ocupa el lugar de la fecha libre en lo que falta jugar. Las fechas jugadas quedan como libre.'
          : 'Todavía no se jugó ningún partido: se regenera el fixture con el equipo nuevo.';
        const idx = await this.alertService.pickOneAlert('Sumar equipo', text, options.map(t => t.name), 'Sumar');
        if (idx === null) return;
        this.tournamentService.addTeam(this.tournament.code, options[idx].id).subscribe({
          next: () => this.alertService.successAlert(`${options[idx].name} se sumó al torneo`),
          error: (e) => this.alertService.errorAlert(e?.error?.error ?? e?.error?.message ?? 'No se pudo sumar el equipo.')
        });
      },
      error: () => this.alertService.errorAlert('No se pudieron cargar tus equipos.')
    });
  }
  async finishTournament() {
    const answer = await this.alertService.confirmAlert('Finalizar torneo', 'Se da por terminado el torneo con los resultados actuales. Es irreversible: después no se podrán cargar ni corregir resultados, ni generar playoffs. Los premios quedan bloqueados.', 'Finalizar torneo');
    if (!answer.isConfirmed) return;
    this.tournamentService.finishTournament(this.tournament.code).subscribe({
      next: () => this.alertService.successAlert('¡Torneo finalizado!'),
      error: (e: HttpErrorResponse) => this.alertService.errorAlert(httpErrorMessage(e, 'No se pudo finalizar el torneo.')),
    });
  }
  private readonly destroyRef = inject(DestroyRef);

  searchTeam(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    const qualifiedSet = new Set(this.teamsQualify.map(team => team.idParticipant));

    this.tournamentParticipantCopy = playoffEligible(this.tournament.participants)
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
    private sessionService: SessionService,
    private adminService: AdminService
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
        // Bug 8: si el usuario ya habia elegido una fecha de este torneo (p. ej. antes de "Corregir resultado"), se mantiene.
        const kept = this.keptRound();
        if (kept !== null && kept < this.tournament.matchDays.length) {
          this.selectedMatchDay = kept;
          this.bindingSelect = kept;
          this.matchDayStatus = this.tournament.matchDays[kept].isFinished;
        } else {
        this.selectedMatchDay = lastFinishedMatchDay ? lastFinishedMatchDay.numberOfMatchDay + 1 : 0;
        this.bindingSelect = this.selectedMatchDay;
        if (this.selectedMatchDay === this.tournament.matchDays.length) {
          this.selectedMatchDay = this.tournament.matchDays.length - 1;
          this.bindingSelect = this.selectedMatchDay;
          this.matchDayStatus = this.tournament.matchDays[this.selectedMatchDay].isFinished;
        }
        }
        this.sortMatchDays();
        this.orderForDateMatchDay();
      },
    });
  }

  private roundKey(): string | null { return this.tournament?.code ? 'fixtureRound:' + this.tournament.code : null; }
  private keptRound(): number | null {
    const key = this.roundKey(); if (!key || typeof sessionStorage === 'undefined') return null;
    const v = sessionStorage.getItem(key); const n = v === null ? NaN : Number(v);
    return Number.isInteger(n) && n >= 0 ? n : null;
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
    const key = this.roundKey();
    if (key && typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, String(this.selectedMatchDay));
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
    if (this.busy) return; // antes de cualquier confirmacion

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
        // Reabrir no pasa por el dialogo de MVP (antes mostraba "Ningun partido tiene MVP" con datos viejos).
        if (result.isConfirmed) this.sendClose(false, '');
      });
  }

  roundLabel = roundLabel;

  private pendingCloseKind: 'fecha' | 'playoffs' | 'torneo' = 'fecha';
  closeSuccessText(status: boolean): string {
    if (!status) return 'Fecha reabierta';
    return this.pendingCloseKind === 'torneo' ? 'Final cerrada' : this.pendingCloseKind === 'playoffs' ? 'Instancia de playoffs cerrada' : 'Fecha cerrada';
  }

  /** Retest 24/10: antes de armar el dialogo se piden los datos frescos de la fecha (sin cache): despues de
   *  "Corregir resultado" o "Reabrir fecha" el estado en memoria podia no tener el MVP nuevo ni el estado real. */
  closeMatchDay(status: boolean, closeKind: 'fecha' | 'playoffs' | 'torneo' = 'fecha') {
    if (this.closing || this.refreshingForClose) return;
    const code = this.tournament?.code;
    if (!code) { this.closeMatchDayWithData(status, closeKind); return; }
    const round = this.selectedMatchDay;
    this.refreshingForClose = true;
    this.tournamentService.getTournamentFull(code, true).subscribe({
      next: () => { this.refreshingForClose = false; this.selectedMatchDay = round; this.bindingSelect = round; this.closeMatchDayWithData(status, closeKind); },
      error: (e: HttpErrorResponse) => { this.refreshingForClose = false; this.alertService.errorAlert(httpErrorMessage(e, 'No pudimos actualizar la fecha. Prob\u00e1 de nuevo.')); }
    });
  }
  refreshingForClose = false;
  /** Botones de cerrar/reabrir deshabilitados mientras se envia o se refrescan los datos de la fecha. */
  get busy(): boolean { return this.closing || this.refreshingForClose; }

  private closeMatchDayWithData(status: boolean, closeKind: 'fecha' | 'playoffs' | 'torneo' = 'fecha') {
    if (this.closing) return;
    this.pendingCloseKind = closeKind;

    this.playersMvpS = [];

    if (this.selectedMatchDay != 0) {
      if (!this.tournament.matchDays[this.selectedMatchDay - 1].isFinished) {
        this.alertService.errorAlert('Primero debes finalizar la fecha anterior');
        return;
      }
    }

    const unfinishedMatch = this.tournament.matchDays[this.selectedMatchDay].matches.find(match => !match.isFinished);
    if (unfinishedMatch) {
      if (isByeMatch(unfinishedMatch)) {
        unfinishedMatch.isFinished = true;
      } else {
        this.alertService.errorAlert('Falta cargar el resultado de ' + unfinishedMatch.homeTeam + ' vs ' + unfinishedMatch.awayTeam + '. Cargalo antes de cerrar.');
        return;
      }
    }

    //ADVERTIR QUE ES LA ULTIMA FECHA 
    if (this.selectedMatchDay === this.tournament.matchDays.length - 1 && !this.tournament.matchDays[this.selectedMatchDay].isFinished && !this.tournament.matchDays[this.selectedMatchDay].isPlayOff) {
      // Retest 24/10: con MVP, la advertencia va dentro del mismo dialogo (un solo paso).
      if (mvpCandidates(this.tournament.matchDays[this.selectedMatchDay].matches).length > 0) { this.closeMatchDayWithMvp(status, 'Es la \u00faltima fecha de la fase regular: despu\u00e9s pod\u00e9s generar playoffs o finalizar el torneo. '); return; }
      this.alertService.confirmAlert('⚠️ ADVERTENCIA ⚠️', 'Es la \u00faltima fecha de la fase regular. Despu\u00e9s pod\u00e9s generar playoffs o finalizar el torneo con el bot\u00f3n "Finalizar torneo". Ning\u00fan partido tiene MVP cargado, as\u00ed que se cierra sin MVP de la fecha (para elegirlo, carg\u00e1 el MVP en el resultado de cada partido antes de cerrar).', 'Confirmar')
        .then((result) => {
          if (result.isConfirmed) {
            if (!this.tournament.matchDays[this.selectedMatchDay].isFinished && mvpCandidates(this.tournament.matchDays[this.selectedMatchDay].matches).length > 0) {
              this.closeMatchDayWithMvp(status);
            } else {
              this.openMatchDay(status);
            }
          }
        });
      return;
    }

    if (!this.tournament.matchDays[this.selectedMatchDay].isFinished && mvpCandidates(this.tournament.matchDays[this.selectedMatchDay].matches).length > 0) {
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



  /** Loop 9: un solo envio a la vez (doble toque) y mensaje claro sin red. */
  closing = false;
  private sendClose(status: boolean, mvp: string) {
    if (this.closing) return;
    this.closing = true;
    this.matchDaysService
      .closeMatchDay(this.tournament.matchDays[this.selectedMatchDay].idMatchDay, status, mvp)
      .subscribe({
        next: () => {
          this.alertService.successAlert(this.closeSuccessText(status));
          this.matchDayStatus = false;
          // Estado real (Finalizada / MVP) antes de volver a habilitar los botones.
          const round = this.selectedMatchDay;
          if (this.tournament?.code) this.tournamentService.getTournamentFull(this.tournament.code, true).subscribe({
            next: () => { this.selectedMatchDay = round; this.bindingSelect = round; this.closing = false; },
            error: () => { this.closing = false; }
          });
          else this.closing = false;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.closing = false;
          this.alertService.errorAlert(httpErrorMessage(errorResponse, status ? 'No se pudo cerrar la fecha. Intent\u00e1 de nuevo.' : 'No se pudo reabrir la fecha. Intent\u00e1 de nuevo.'));
        }
      });
  }

  openMatchDay(status: boolean) {
    this.sendClose(status, '');
  }


  closeMatchDayWithMvp(status: boolean, note: string = '') {
    let playerMvp = '';
    this.playersMvpS = ['Seleccionar MVP'];
    this.playersMvpS.push(...mvpCandidates(this.tournament.matchDays[this.selectedMatchDay].matches));
    this.alertService.selectOptionsAlert('Elegí el MVP de la fecha', this.playersMvpS, "Cerrar sin MVP", note)
      .then((result) => {
        if (result.isConfirmed && result.value !== undefined) {
          const playerMvp = this.playersMvpS[result.value];
          if (playerMvp && playerMvp !== 'Seleccionar MVP') {
            this.sendClose(status, playerMvp);
          } else {
            this.alertService.errorAlert('Debe seleccionar un MVP');
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Loop 9: solo el boton "Cerrar sin MVP" cierra sin MVP; Esc, X o un segundo dialogo no cierran la fecha.
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


  /** D: el dialogo de horario arranca con la fecha actual del partido. */
  get selectedMatchDateTime(): string | null {
    return this.tournament?.matchDays?.[this.selectedMatchDay]?.matches?.find((match) => match.id === this.selectedMatchId)?.dateTime ?? null;
  }

  editDate(id: number) {
    this.showPicker = true;
    this.selectedMatchId = id;
  }

  async editDescription(id: number) {
    ///TODO: Implementar la edición de la descripción
    // D: es el numero de cancha; se precarga el actual si ya habia uno.
    const current = this.tournament.matchDays[this.selectedMatchDay].matches.find((match) => match.id === id)?.description ?? '';
    const currentNumber = (String(current).match(/\d+/) ?? [''])[0];
    let description = await this.alertService.updateNumberInputAlert('N\u00famero de cancha', 'Ej.: 3', currentNumber);
    if (description != null) {
      let descripciónString = description.toString();
      this.matchDaysService.updateDescriptionMatch(descripciónString, id).subscribe({
        next: () => {
          this.alertService.successAlert('Cancha actualizada.');

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
          this.alertService.errorAlert(httpErrorMessage(error, 'No se pudo completar la acci\u00f3n. Prob\u00e1 de nuevo.'))
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
        if (isByeMatch(a)) {
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

  async generatePlayOffs() {
    let length = this.teamsQualify.length;

    if (length === 0) {
      this.alertService.errorAlert('No hay equipos clasificados');
      return;
    }
    // Plan 22/10 #8: el cuadro más chico es una final (2 equipos).
    if (length < 2) {
      this.alertService.errorAlert('Elegí al menos 2 equipos para los playoffs');
      return;
    }
    //multiple de 2
    if (!(length > 0 && (length & (length - 1)) === 0)) {
      this.alertService.errorAlert('El valor debe ser una potencia de 2');
      return;
    }

    const teamsIds = this.teamsQualify.map((team) => team.idParticipant);
    const schedule = await this.alertService.playoffScheduleAlert(this.roundName(length));
    if (!schedule) return;
    this.alertService.loadingAlert('Generando playoffs...');
    this.tournamentService.generatePlayOffs(teamsIds, this.tournament.code, schedule).subscribe({
      next: () => {
        this.alertService.successAlert("Playoffs generados correctamente");
        this.showGeneratePlayOffs = false;
        this.teamsQualify = [];
        this.matchDayStatus = false;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.errorAlert(error.error?.error ?? error.error?.message ?? 'No se pudieron generar los playoffs.');
      }
    });
  }

  /** Nombre de la ronda según la cantidad de equipos que la juegan. */
  roundName(teams: number): string {
    return teams === 2 ? 'la final' : teams === 4 ? 'las semifinales' : teams === 8 ? 'los cuartos de final' : teams === 16 ? 'los octavos de final' : 'la ronda';
  }

  showGeneratePlayOffsFunction() {
    this.tournamentParticipantCopy = playoffEligible(this.tournament.participants)
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
    this.alertService.qualifyCountAlert(this.tournament.participants.length)
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
    this.tournamentParticipantCopy = playoffEligible(this.tournament.participants);
    this.orderTeamNoQualify();
    this.teamsQualify = this.tournamentParticipantCopy.slice(0, numTeams);
    this.tournamentParticipantCopy = this.tournamentParticipantCopy.slice(numTeams);
    this.tournamentParticipantCopy.sort(byLeagueRank(this.tournament.participants));
  };

  orderTeamQulify() {
    this.teamsQualify.sort(byLeagueRank(this.tournament.participants));
  }

  orderTeamNoQualify() {
    this.tournamentParticipantCopy.sort(byLeagueRank(this.tournament.participants));
  }

  async generatePlayOffsNoTeams() {
    const last = [...this.tournament.matchDays].sort((a, b) => b.numberOfMatchDay - a.numberOfMatchDay)[0];
    const schedule = await this.alertService.playoffScheduleAlert(this.roundName(last?.matches?.length ?? 0));
    if (!schedule) return;
    this.tournamentService.generatePlayOffs([], this.tournament.code, schedule).subscribe({
      next: () => {
        this.alertService.successAlert("Playoffs generados correctamente");
        this.showGeneratePlayOffs = false;
        this.teamsQualify = [];
        this.tournamentParticipantCopy = [];
        this.matchDayStatus = false;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.errorAlert(httpErrorMessage(error, 'No se pudo completar la acci\u00f3n. Prob\u00e1 de nuevo.'));
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
