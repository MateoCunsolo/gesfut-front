import { canFinish } from './tournament-finish';

describe('Finalizar torneo (revisión #2)', () => {
  const day = (n: number, fin: boolean, po = false, matches = 2) => ({ numberOfMatchDay: n, isFinished: fin, isPlayOff: po, matches: new Array(matches) });
  it('solo con todas las fechas cerradas', () => {
    expect(canFinish({ isFinished: false, matchDays: [day(0, true), day(1, false)] })).toBeFalse();
    expect(canFinish({ isFinished: false, matchDays: [day(0, true), day(1, true)] })).toBeTrue();
  });
  it('con playoffs, recién después de la final', () => {
    expect(canFinish({ isFinished: false, matchDays: [day(0, true), day(1, true, true, 2)] })).toBeFalse();
    expect(canFinish({ isFinished: false, matchDays: [day(0, true), day(1, true, true, 2), day(2, true, true, 1)] })).toBeTrue();
  });
  it('un torneo finalizado no se vuelve a finalizar', () => {
    expect(canFinish({ isFinished: true, matchDays: [day(0, true)] })).toBeFalse();
  });
});
