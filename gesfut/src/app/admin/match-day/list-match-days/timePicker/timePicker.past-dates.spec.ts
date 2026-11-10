import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgModel } from '@angular/forms';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { MatTimepickerInput } from '@angular/material/timepicker';
import { of } from 'rxjs';
import { TimepickerDatepickerIntegrationExample } from './timePicker.component';
import { MatchDaysService } from '../../../../core/services/tournament/match-days.service';
import { AlertService } from '../../../../core/services/alert.service';
import { MatchDateResponse } from '../../../../core/models/matchRequest';

// Regresión renderizando la plantilla: el selector de horario NO debe rechazar fechas ni horas pasadas.
// Cubre "Más > Horario" (un partido), la reprogramación de toda la jornada y la fecha de inicio del torneo.
// Falla si vuelven un [min]/[matDatepickerMin]/[matTimepickerMin], un validador de fecha futura
// o los mensajes "Elegí una fecha de hoy en adelante" / "Elegí una fecha y hora futura para el partido".
describe('app-time-picker acepta fechas y horas pasadas', () => {
  let fixture: ComponentFixture<TimepickerDatepickerIntegrationExample>;
  let component: TimepickerDatepickerIntegrationExample;
  let matchDays: jasmine.SpyObj<MatchDaysService>;
  let alerts: jasmine.SpyObj<AlertService>;

  const yesterday = (): Date => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(20, 0, 0, 0);
    return d;
  };
  // Hoy 00:00: es hoy y ya pasó (salvo durante el primer minuto del día).
  const todayAtMidnight = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  beforeEach(async () => {
    matchDays = jasmine.createSpyObj<MatchDaysService>('MatchDaysService', ['updateDateMatch', 'udpateAllMatchesDates']);
    alerts = jasmine.createSpyObj<AlertService>('AlertService', ['loadingAlert', 'successAlert', 'errorAlert', 'confirmAlert']);
    matchDays.updateDateMatch.and.returnValue(of({ newDate: 'TEST' } as MatchDateResponse));
    matchDays.udpateAllMatchesDates.and.returnValue(of([] as MatchDateResponse[]));
    alerts.confirmAlert.and.returnValue(Promise.resolve({ isConfirmed: true }) as any);

    await TestBed.configureTestingModule({
      imports: [TimepickerDatepickerIntegrationExample],
      providers: [
        provideNoopAnimations(),
        { provide: MatchDaysService, useValue: matchDays },
        { provide: AlertService, useValue: alerts },
      ],
    }).compileComponents();
  });

  async function render(inputs: Record<string, unknown>, value: Date): Promise<void> {
    fixture = TestBed.createComponent(TimepickerDatepickerIntegrationExample);
    component = fixture.componentInstance;
    for (const [name, input] of Object.entries(inputs)) fixture.componentRef.setInput(name, input);
    component.dateValue = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    component.timeValue = new Date(value);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function expectPickersValidAndNoFutureMessage(): void {
    const dateModel = fixture.debugElement.query(By.directive(MatDatepickerInput)).injector.get(NgModel);
    const timeModel = fixture.debugElement.query(By.directive(MatTimepickerInput)).injector.get(NgModel);
    expect(dateModel.errors).toBeNull();
    expect(timeModel.errors).toBeNull();
    const text: string = fixture.nativeElement.textContent;
    expect(text).not.toContain('Elegí una fecha de hoy en adelante');
    expect(text).not.toContain('Elegí una fecha y hora futura para el partido');
  }

  async function confirm(): Promise<void> {
    const button = fixture.debugElement.queryAll(By.css('button'))
      .find(b => (b.nativeElement.textContent as string).includes('Confirmar horario'));
    expect(button).withContext('botón "Confirmar horario"').toBeDefined();
    button!.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  for (const [label, makeDate] of [['fecha pasada (ayer)', yesterday], ['hora pasada de hoy', todayAtMidnight]] as const) {
    it(`Más > Horario: ${label} se envía sin error`, async () => {
      const date = makeDate();
      await render({ matchId: 7 }, date);
      expectPickersValidAndNoFutureMessage();
      await confirm();
      expect(alerts.errorAlert).not.toHaveBeenCalled();
      expect(matchDays.updateDateMatch).toHaveBeenCalledOnceWith(component.converDateToISO(date), 7);
      expectPickersValidAndNoFutureMessage();
    });

    it(`toda la jornada: ${label} se envía sin error`, async () => {
      const date = makeDate();
      await render({ isForAllMatches: true, matchDayId: 3 }, date);
      expectPickersValidAndNoFutureMessage();
      await confirm();
      expect(alerts.errorAlert).not.toHaveBeenCalled();
      expect(matchDays.udpateAllMatchesDates).toHaveBeenCalledOnceWith(component.converDateToISO(date), 3, component.plusMinutes);
    });

    it(`inicio del torneo: ${label} se emite sin error`, async () => {
      const date = makeDate();
      await render({ isToInitTournament: true }, date);
      const emitted: string[] = [];
      component.sendDate.subscribe(v => emitted.push(v));
      expectPickersValidAndNoFutureMessage();
      await confirm();
      expect(alerts.errorAlert).not.toHaveBeenCalled();
      expect(emitted).toEqual([component.converDateToISO(date)]);
    });
  }
});
