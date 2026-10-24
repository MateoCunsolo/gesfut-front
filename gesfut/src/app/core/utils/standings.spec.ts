import { byLeagueRank, compareStandings } from './standings';

describe('standings (revisión crítica #8)', () => {
  it('respeta el orden del backend aunque las estadísticas empaten', () => {
    const table = [{ idParticipant: 7 }, { idParticipant: 3 }, { idParticipant: 5 }];
    const list = [{ idParticipant: 5 }, { idParticipant: 3 }, { idParticipant: 7 }];
    expect([...list].sort(byLeagueRank(table)).map(p => p.idParticipant)).toEqual([7, 3, 5]);
  });
  it('compareStandings ordena por puntos, diferencia y goles', () => {
    expect(compareStandings({ points: 3, goalsFor: 1, goalsAgainst: 0 }, { points: 1, goalsFor: 5, goalsAgainst: 0 })).toBeLessThan(0);
  });
});
