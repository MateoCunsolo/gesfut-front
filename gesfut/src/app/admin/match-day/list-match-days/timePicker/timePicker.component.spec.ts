import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TimepickerDatepickerIntegrationExample } from './timePicker.component';
import { MatchDaysService } from '../../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../../core/services/alert.service';
import { MatchDateResponse } from '../../../../core/models/matchRequest';

// Regresión: el selector de fecha no debe bloquear fechas u horas pasadas; la regla la decide el back.
// Se instancia la clase sin renderizar la plantilla (no hace falta Material ni animaciones).
// El componente guarda fecha y hora en modelos separados (dateValue/timeValue); alue es solo lectura.
function setValue(c: TimepickerDatepickerIntegrationExample, d: Date): void {
  c.dateValue = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  c.timeValue = new Date(d);
}

describe('TimepickerDatepickerIntegrationExample: programar con fecha pasada', () => {
  let matchDays: jasmine.SpyObj<MatchDaysService>;
  let alerts: jasmine.SpyObj<AlertService>;
  let component: TimepickerDatepickerIntegrationExample;

  beforeEach(() => {
    matchDays = jasmine.createSpyObj<MatchDaysService>('MatchDaysService', ['updateDateMatch', 'udpateAllMatchesDates']);
    alerts = jasmine.createSpyObj<AlertService>('AlertService', ['loadingAlert', 'successAlert', 'errorAlert', 'confirmAlert']);
    TestBed.configureTestingModule({
      providers: [
        { provide: MatchDaysService, useValue: matchDays },
        { provide: AlertService, useValue: alerts },
      ],
    });
    component = TestBed.runInInjectionContext(() => new TimepickerDatepickerIntegrationExample());
    matchDays.updateDateMatch.and.returnValue(of({ newDate: 'TEST' } as MatchDateResponse));
  });

  it('envía al back una fecha de ayer', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setSeconds(0, 0); // el componente arma la fecha sin segundos
    component.matchId = 7;
    setValue(component, yesterday);

    component.dateFunction();

    expect(alerts.errorAlert).not.toHaveBeenCalled();
    expect(matchDays.updateDateMatch).toHaveBeenCalledOnceWith(component.converDateToISO(yesterday), 7);
  });

  it('envía al back hoy a una hora que ya pasó', () => {
    const earlierToday = new Date(Date.now() - 60 * 60 * 1000);
    earlierToday.setSeconds(0, 0);
    component.matchId = 8;
    setValue(component, earlierToday);

    component.dateFunction();

    expect(alerts.errorAlert).not.toHaveBeenCalled();
    expect(matchDays.updateDateMatch).toHaveBeenCalledOnceWith(component.converDateToISO(earlierToday), 8);
  });

  it('al inicializar un torneo emite una fecha de inicio pasada', () => {
    const past = new Date(2020, 0, 1, 10, 0);
    const emitted: string[] = [];
    component.isToInitTournament = true;
    setValue(component, past);
    component.sendDate.subscribe(value => emitted.push(value));

    component.dateFunction();

    expect(emitted).toEqual([component.converDateToISO(past)]);
    expect(alerts.errorAlert).not.toHaveBeenCalled();
  });

  it('precarga la fecha y hora de un partido que ya paso (antes se ignoraba)', () => {
    component.initialDateTime = '2020-03-04T21:30:00';
    expect(component.dateValue).toEqual(new Date(2020, 2, 4));
    expect(component.value).toEqual(new Date(2020, 2, 4, 21, 30, 0, 0));
  });

  // Contrato con el back (MatchDateRequestJsonTests): se manda la hora de pared de Argentina con sufijo Z,
  // y el back descarta la Z. Vale en cualquier zona horaria del navegador.
  it('converDateToISO manda la hora de pared de Argentina con sufijo Z', () => {
    const d = new Date(Date.UTC(2026, 10, 14, 23, 0, 0)); // 14/11/2026 20:00 en Argentina (UTC-3)
    expect(component.converDateToISO(d)).toBe('2026-11-14T20:00:00.000Z');
  });
});