import { addTeamMode } from './add-team';

const day = (isFinished: boolean, played: boolean, isPlayOff = false) => ({ isFinished, isPlayOff, matches: [{ isFinished: played, isBye: false }] });
const teams = (n: number) => Array.from({ length: n }, (_, i) => ({ name: 'TEST ' + i }));

describe('addTeamMode (respuesta 3)', () => {
  it('antes de empezar e impar se puede', () => expect(addTeamMode({ participants: teams(3), matchDays: [day(false, false)] })).toBe('before-start'));
  it('par (2 o 4) nunca, ni antes de empezar', () => { expect(addTeamMode({ participants: teams(2), matchDays: [day(false, false)] })).toBeNull(); expect(addTeamMode({ participants: teams(4), matchDays: [day(false, false)] })).toBeNull(); });
  it('empezado e impar: reemplaza la fecha libre', () => expect(addTeamMode({ participants: teams(3), matchDays: [day(true, true)] })).toBe('replace-free'));
  it('empezado y par: no', () => expect(addTeamMode({ participants: teams(4), matchDays: [day(true, true)] })).toBeNull());
  it('playoffs, finalizado o archivado: no', () => {
    expect(addTeamMode({ participants: teams(3), matchDays: [day(true, true), day(false, false, true)] })).toBeNull();
    expect(addTeamMode({ isFinished: true, participants: teams(3), matchDays: [day(false, false)] })).toBeNull();
    expect(addTeamMode({ isActive: false, participants: teams(3), matchDays: [day(false, false)] })).toBeNull();
  });
});
