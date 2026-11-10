import { parseDmyTime, playoffScheduleError } from './date-input';

describe('playoffScheduleError', () => {
  it('acepta una fecha pasada (ya no exige fecha futura)', () => {
    const start = parseDmyTime('01/01/2020', '20:00');
    expect(start).toBe('2020-01-01T20:00:00');
    expect(playoffScheduleError(start, 60)).toBeNull();
  });
  it('acepta una fecha futura y 0 minutos', () => {
    expect(playoffScheduleError(parseDmyTime('01/01/2099', '09:30'), 0)).toBeNull();
  });
  it('rechaza una fecha mal escrita', () => {
    expect(playoffScheduleError(parseDmyTime('31/02/2026', '20:00'), 60)).toContain('dd/mm/aaaa');
    expect(playoffScheduleError(null, 60)).toContain('hh:mm');
  });
  it('rechaza minutos fuera de 0 a 600', () => {
    expect(playoffScheduleError('2026-11-14T20:00:00', -1)).toContain('0 y 600');
    expect(playoffScheduleError('2026-11-14T20:00:00', 601)).toContain('0 y 600');
    expect(playoffScheduleError('2026-11-14T20:00:00', NaN)).toContain('0 y 600');
  });
  it('el mensaje ya no pide fecha futura', () => {
    expect(playoffScheduleError(null, 60)).not.toContain('futura');
  });
});