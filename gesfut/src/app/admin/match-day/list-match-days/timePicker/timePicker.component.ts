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
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TournamentService } from '../../../../core/services/tournament/tournament.service';
import { MatchDaysService } from '../../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../../core/services/alert.service';
import { MatchDateResponse } from '../../../../core/models/matchRequest';

/** @title Timepicker integration with datepicker */
@Component({
  selector: 'app-time-picker',
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'es-AR'}],
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
        <input matInput [matDatepicker]="datepicker" [(ngModel)]="value" />
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
          [(ngModel)]="value"
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
        <input matInput type="number" min="7" [(ngModel)]="plusDays"/> </mat-form-field
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
  private matchDayServices = inject(MatchDaysService);
  private alertService = inject(AlertService);
  value: Date = new Date();
  plusMinutes: number = 60;
  plusDays: number = 7;
  @Input() isToInitTournament: boolean = false;
  @Input() matchId: number = 0;
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
    console.log('Fecha original desde Timepicker:', this.value);

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
    if (this.value) {
      let localDateTime = this.converDateToISO(this.value);
      if (this.isForAllMatches && this.plusMinutes) {
        this.infoAlertsAndContinue(localDateTime, this.matchDayId, this.plusMinutes);
      } else if(!this.isToInitTournament) {
        this.alertService.loadingAlert('Actualizando fecha...');
        this.updateOneMatchDate(localDateTime, this.matchId);
      }else if(this.isToInitTournament){
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
        console.error('Error en la solicitud HTTP:', err);
        this.alertService.errorAlert(err.error.error);
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
        console.error('Error en la solicitud HTTP:', err);
        this.alertService.errorAlert(err.error.error);
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
