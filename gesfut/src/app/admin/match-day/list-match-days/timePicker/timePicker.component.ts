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
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TournamentService } from '../../../../core/services/tournament/tournament.service';
import { MatchDaysService } from '../../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../../core/services/alert.service';
import { MatchDateResponse } from '../../../../core/models/matchRequest';

/** @title Timepicker integration with datepicker */
@Component({
  selector: 'app-time-picker',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatDatepickerModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="column">
      <div class="toRight">
        <svg
          class="icon"
          (click)="cancelPickerFunction()"
          viewBox="0 0 32 32"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
          fill="#000000"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <title>cross-square</title>
            <desc>Created with Sketch Beta.</desc>
            <defs></defs>
            <g
              id="Page-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              sketch:type="MSPage"
            >
              <g
                id="Icon-Set-Filled"
                sketch:type="MSLayerGroup"
                transform="translate(-206.000000, -1037.000000)"
                fill="#2a6a49"
              >
                <path
                  d="M226.95,1056.54 C227.34,1056.93 227.34,1057.56 226.95,1057.95 C226.559,1058.34 225.926,1058.34 225.536,1057.95 L222,1054.41 L218.464,1057.95 C218.074,1058.34 217.441,1058.34 217.05,1057.95 C216.66,1057.56 216.66,1056.93 217.05,1056.54 L220.586,1053 L217.05,1049.46 C216.66,1049.07 216.66,1048.44 217.05,1048.05 C217.441,1047.66 218.074,1047.66 218.464,1048.05 L222,1051.59 L225.536,1048.05 C225.926,1047.66 226.559,1047.66 226.95,1048.05 C227.34,1048.44 227.34,1049.07 226.95,1049.46 L223.414,1053 L226.95,1056.54 L226.95,1056.54 Z M234,1037 L210,1037 C207.791,1037 206,1038.79 206,1041 L206,1065 C206,1067.21 207.791,1069 210,1069 L234,1069 C236.209,1069 238,1067.21 238,1065 L238,1041 C238,1038.79 236.209,1037 234,1037 L234,1037 Z"
                  id="cross-square"
                  sketch:type="MSShapeGroup"
                ></path>
              </g>
            </g>
          </g>
        </svg>
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
      

      <button class="base-button" (click)="dateFunction()">CARGAR FECHA</button>
    </section>
  `,
  styles: [
    `
      mat-form-field {
        margin-right: 12px;
      }

      .column {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .toRight {
        display: flex;
        justify-content: flex-end;
      }

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
