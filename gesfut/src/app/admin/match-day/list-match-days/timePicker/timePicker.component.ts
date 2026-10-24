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
import { provideNativeDateAdapter, MAT_DATE_LOCALE, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

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

/** @title Timepicker integration with datepicker */
@Component({
  selector: 'app-time-picker',
  providers: [provideNativeDateAdapter(), {provide: DateAdapter, useClass: EsDateAdapter}, {provide: MAT_DATE_LOCALE, useValue: 'es-AR'}],
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
        <input matInput [matDatepicker]="datepicker" [(ngModel)]="dateValue" [min]="minDate" />
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
        <mat-label>Duracion estimada del partido en minutos</mat-label>
        <input matInput type="number" min="45" [(ngModel)]="plusMinutes"/> </mat-form-field
      >}
      
      @if(isToInitTournament){
        <mat-form-field>
        <mat-label>Intervalo de dias entre jornadas</mat-label>
        <input matInput type="number" min="1" aria-label="Intervalo de d\u00edas entre jornadas" [(ngModel)]="plusDays"/> </mat-form-field
      >}
      

      <button class="base-button" (click)="dateFunction()">Confirmar horario</button>
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
  /** Recorrido 22/10: fecha y hora en modelos separados (elegir el día ya no pisa la hora con 00:00). */
  minDate: Date = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
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
  /** D: precarga la fecha/hora actual del partido (si es futura; una pasada no se podria confirmar). */
  @Input() set initialDateTime(value: string | null) {
    if (!value) return;
    const d = new Date(value);
    if (isNaN(d.getTime()) || d.getTime() < Date.now()) return;
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

  dateFunction() {
    const chosen = this.value;
    if (chosen && (this.isToInitTournament || this.isForAllMatches) && chosen.getTime() < this.minDate.getTime()) {
      this.alertService.errorAlert('Elegí una fecha de hoy en adelante.');
      return;
    }
    // Plan 22/10 #5: un partido suelto solo con fecha y hora futura.
    if (chosen && !this.isToInitTournament && !this.isForAllMatches && chosen.getTime() < Date.now()) {
      this.alertService.errorAlert('Elegí una fecha y hora futura para el partido.');
      return;
    }
    if (chosen) {
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
      this.alertService.errorAlert('Debe seleccionar una fecha y hora válida');
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
