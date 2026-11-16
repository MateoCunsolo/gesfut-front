import { httpErrorMessage } from '../../../../core/utils/http-error';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

/** Selector en 24 h (hourCycle h23). No se ocultan horas pasadas: hace falta programar partidos ya jugados. */
const TIME_24H_FORMATS = {
  parse: { dateInput: null, timeInput: null },
  display: {
    dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
    timeInput: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
    timeOptionLabel: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};


/** Recorrido 22/10: aceptar fechas escritas a mano como dd/mm/aaaa. */
@Injectable()
export class EsDateAdapter extends NativeDateAdapter {
  override parse(value: any, parseFormat?: any): Date | null {
    if (typeof value === 'string') {
      const m = value.trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
      if (m) {
        const year = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
        const date = new Date(year, Number(m[2]) - 1, Number(m[1]));
        return date.getMonth() === Number(m[2]) - 1 ? date : null;
      }
    }
    return super.parse(value, parseFormat);
  }
}
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TournamentService } from '../../../../core/services/tournament/tournament.service';
import { MatchDaysService } from '../../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../../core/services/alert.service';
import { MatchDateResponse } from '../../../../core/models/matchRequest';
import { collectScheduleWarnings } from '../../../../core/utils/schedule-warnings';
import { wallClockToArtInstant } from '../../../../core/utils/can-load-result';
import { isByeMatch } from '../../../../core/utils/bye';

/** @title Timepicker integration with datepicker */
@Component({
  selector: 'app-time-picker',
  providers: [provideNativeDateAdapter(), {provide: DateAdapter, useClass: EsDateAdapter}, {provide: MAT_DATE_LOCALE, useValue: 'es-AR'}, {provide: MAT_DATE_FORMATS, useValue: TIME_24H_FORMATS}],
  imports: [
    CdkTrapFocus,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatDatepickerModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="column" role="dialog" aria-modal="true" aria-label="Elegir fecha y horario" [cdkTrapFocus]="true" [cdkTrapFocusAutoCapture]="true">
      <div class="toRight">
        <button type="button" class="icon-action" aria-label="Cerrar selector de fecha" (click)="cancelPickerFunction()"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>

      @if(isForAllMatches){
      <h3>Actualizar fecha de todos los partidos</h3>
      }@else if(isToInitTournament){
      <h3>Seleccionar fecha del primer partido del torneo</h3>
      }@else {
      <h3>Actualizar fecha del partido</h3>
      }

      <mat-form-field>
        @if(isForAllMatches){
        <mat-label>Elegir fecha del partido inicial</mat-label>
        }@else {
        <mat-label>Elegir fecha</mat-label>
        }
        <input matInput [matDatepicker]="datepicker" [(ngModel)]="dateValue" />
        <mat-datepicker #datepicker />
        <mat-datepicker-toggle [for]="datepicker" matSuffix />
      </mat-form-field>

      <mat-form-field>
        @if(isForAllMatches){
        <mat-label>Elegir hora del partido inicial</mat-label>
        }@else {
        <mat-label>Elegir hora</mat-label>
        }
        <input
          matInput
          [matTimepicker]="timepicker"
          [(ngModel)]="timeValue"
          [ngModelOptions]="{ updateOn: 'blur' }"
        />
        <mat-timepicker #timepicker />
        <mat-timepicker-toggle [for]="timepicker" matSuffix />
      </mat-form-field>

      @if(isForAllMatches || isToInitTournament){
      <mat-form-field>
        <mat-label>Duraci\u00f3n estimada del partido en minutos</mat-label>
        <input matInput type="number" min="45" [(ngModel)]="plusMinutes"/> </mat-form-field
      >}
      
      @if(isToInitTournament){
        <mat-form-field>
        <mat-label>Intervalo de d\u00edas entre jornadas</mat-label>
        <input matInput type="number" min="1" aria-label="Intervalo de d\u00edas entre jornadas" [(ngModel)]="plusDays"/> </mat-form-field
      >}
      

      <div class="timepicker-gap" aria-hidden="true"></div>
      <button class="base-button confirm-time" (click)="dateFunction()">Confirmar horario</button>
    </section>
  `,
  styles: [
    `
      mat-form-field {
        width:100%;margin:0;
      }

      .column {
        display: flex;
        flex-direction: column;
        gap:12px;
      }
      .timepicker-gap { min-height: min(240px, 42vh); }
      .confirm-time { position: sticky; bottom: 0; z-index: 2; padding-top: 8px; background: var(--surface); }
      

      .toRight {
        display: flex;
        justify-content: flex-end;
      }

      h3 {font-size:1.8rem;margin-bottom:8px;}

      .icon {
        cursor: pointer;
        width: 20px;
        filter: invert(0.5);
        &:hover {
          transform: scale(1.1);
          filter: invert(0);
        }
      }
    `,
  ],
})
export class TimepickerDatepickerIntegrationExample {
  /** Auditoria 22/10 (#15): el tema de Material (mismos colores) se carga solo cuando se usa el selector de horario. */
  private readonly materialTheme = (() => {
    if (typeof document !== 'undefined' && !document.getElementById('material-theme')) {
      const link = document.createElement('link');
      link.id = 'material-theme'; link.rel = 'stylesheet'; link.href = 'material-theme.css';
      document.head.appendChild(link);
    }
    return true;
  })();

  private matchDayServices = inject(MatchDaysService);
  private alertService = inject(AlertService);
  private tournamentService = inject(TournamentService);
  /** Recorrido 22/10: fecha y hora en modelos separados (elegir el día ya no pisa la hora con 00:00). */
  dateValue: Date | null = new Date();
  timeValue: Date | null = (() => { const d = new Date(); d.setHours(20, 0, 0, 0); return d; })();
  get value(): Date | null {
    if (!this.dateValue || !this.timeValue) return null;
    const d = new Date(this.dateValue), t = new Date(this.timeValue);
    if (isNaN(d.getTime()) || isNaN(t.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.getHours(), t.getMinutes(), 0, 0);
  }
  plusMinutes: number = 60;
  plusDays: number = 7;
  @Input() isToInitTournament: boolean = false;
  @Input() matchId: number = 0;
  /** D: precarga la fecha/hora actual del partido (futura o pasada: desde 10/11 se puede reprogramar a cualquier fecha). */
  @Input() set initialDateTime(value: string | null) {
    if (!value) return;
    const d = new Date(value);
    if (isNaN(d.getTime())) return;
    this.dateValue = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const t = new Date(); t.setHours(d.getHours(), d.getMinutes(), 0, 0);
    this.timeValue = t;
  }
  @Input() matchDayId: number = 0;
  @Input() isForAllMatches: boolean = false;
  @Output() cancelPicker = new EventEmitter<Boolean>();
  @Output() sendDate = new EventEmitter<string>();
  @Output() sendAllDates = new EventEmitter<MatchDateResponse[]>();
  @Output() sendMinutesAndDays = new EventEmitter<{minutes: number, days: number}>();
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isForAllMatches']) {
      this.isForAllMatches = changes['isForAllMatches'].currentValue;
    }
  }

  cancelPickerFunction() {
    this.cancelPicker.emit(false);
  }

  converDateToISO(value: Date): string {

    // Crear una nueva instancia asegurando que sea un objeto Date válido
    const date = new Date(value);

    // Ajustar manualmente a la zona horaria de Argentina (GMT-3)
    const offsetArgentina = 3 * 60; // -3 horas en minutos
    const localISO = new Date(
      date.getTime() - offsetArgentina * 60 * 1000
    ).toISOString();

    return localISO;
  }

  private tournamentMatches() {
    const days = this.tournamentService.currentTournament.value?.matchDays ?? [];
    return days.flatMap((day) => (day.matches ?? []).map((match) => ({
      id: match.id,
      dateTime: match.dateTime,
      description: match.description,
      isBye: isByeMatch(match) || !!match.isBye,
    })));
  }

  private currentMatchDay() {
    const days = this.tournamentService.currentTournament.value?.matchDays ?? [];
    return days.find((day) => day.idMatchDay === this.matchDayId) ?? days.find((day) => (day.matches ?? []).some((m) => m.id === this.matchId));
  }

  private async confirmScheduleWarnings(chosen: Date): Promise<boolean> {
    if (this.isToInitTournament) return true;
    const day = this.currentMatchDay();
    const days = this.tournamentService.currentTournament.value?.matchDays ?? [];
    const allMatches = this.tournamentMatches();
    const art = wallClockToArtInstant(chosen);
    let ignoreIds: number[] = [];
    let venue: string | null | undefined;
    const extraChosen: { time: Date; venue?: string | null }[] = [];
    if (this.isForAllMatches && day) {
      ignoreIds = (day.matches ?? []).filter((m) => m.id && !isByeMatch(m)).map((m) => m.id);
      let offset = 0;
      for (const match of day.matches ?? []) {
        if (!match.id || isByeMatch(match)) continue;
        const t = new Date(art.getTime() + offset * 60 * 1000);
        extraChosen.push({ time: t, venue: match.description });
        offset += Number(this.plusMinutes) || 0;
      }
      // el primero se evalua tambien como chosen+venue del primer partido
      const first = extraChosen[0];
      venue = first?.venue;
    } else {
      ignoreIds = this.matchId ? [this.matchId] : [];
      venue = day?.matches?.find((m) => m.id === this.matchId)?.description;
    }
    const messages = collectScheduleWarnings({
      chosen: this.isForAllMatches ? (extraChosen[0]?.time ?? art) : art,
      venue,
      allMatches,
      ignoreIds,
      extraChosen: this.isForAllMatches ? extraChosen.slice(1) : [],
      days,
      currentNumberOfMatchDay: day?.numberOfMatchDay ?? 0,
    });
    if (!messages.length) return true;
    const result = await this.alertService.confirmAlert('Atenci\u00f3n', messages.join('\n\n'), 'Continuar');
    return !!result?.isConfirmed;
  }

  async dateFunction() {
    // 10/11: se aceptan fechas y horas pasadas (carga historica); las reglas de orden las valida el back.
    const chosen = this.value;
    if (chosen) {
      if (!(await this.confirmScheduleWarnings(chosen))) return;
      let localDateTime = this.converDateToISO(chosen);
      if (this.isForAllMatches && this.plusMinutes) {
        this.infoAlertsAndContinue(localDateTime, this.matchDayId, this.plusMinutes);
      } else if(!this.isToInitTournament) {
        this.alertService.loadingAlert('Actualizando fecha...');
        this.updateOneMatchDate(localDateTime, this.matchId);
      }else if(this.isToInitTournament){
        if (!(Number(this.plusDays) >= 1)) { this.alertService.errorAlert('El intervalo entre fechas tiene que ser de al menos 1 d\u00eda.'); return; }
        if (!(Number(this.plusMinutes) >= 1)) { this.alertService.errorAlert('La duraci\u00f3n de cada partido tiene que ser de al menos 1 minuto.'); return; }
        this.sendDate.emit(localDateTime);
        this.sendMinutesAndDays.emit({minutes: this.plusMinutes, days: this.plusDays});
        this.cancelPickerFunction();
      }
    } else
      this.alertService.errorAlert('Debe seleccionar una fecha y hora v\u00e1lida');
  }

  updateOneMatchDate(date: string, idMatch: number) {
    this.matchDayServices.updateDateMatch(date, idMatch).subscribe({
      next: (response: MatchDateResponse) => {
        this.alertService.successAlert('Fecha actualizada');
        this.sendDate.emit(response.newDate);
        this.cancelPickerFunction();
      },
      error: (err) => {
        this.alertService.errorAlert(httpErrorMessage(err, 'No se pudo completar la acci\u00f3n. Prob\u00e1 de nuevo.'));
      },
    });
  }

  updateAllMatchesDates(date: string, idMatchDay: number, plusMinutes: number) {
    this.matchDayServices.udpateAllMatchesDates(date, idMatchDay, plusMinutes).subscribe({
      next: (response : MatchDateResponse[]) => {
        this.alertService.successAlert('Fechas actualizadas correctamente');
        this.cancelPickerFunction();
        this.sendAllDates.emit(response);
      },
      error: (err) => {
        this.alertService.errorAlert(httpErrorMessage(err, 'No se pudo completar la acci\u00f3n. Prob\u00e1 de nuevo.'));
      },
    });
  }

  infoAlertsAndContinue(date: string, idMatchDay: number, plusMinutes: number) {
    this.alertService
      .confirmAlert(
        'Actualizar todas las fechas',
        '¿Está seguro que desea actualizar todas las fechas de los partidos de esta jornada?',
        'Aceptar'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.alertService.loadingAlert('Actualizando fecha...');
          this.updateAllMatchesDates(date, idMatchDay, plusMinutes);
        } else {
          this.cancelPickerFunction();
        }
      });
  }
}
