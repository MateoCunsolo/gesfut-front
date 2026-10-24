import { isByeMatch, playoffEligible, restingTeam } from './bye';

describe('fecha libre (plan 22/10 #2)', () => {
  it('reconoce "Free" aunque el backend no mande el flag', () => {
    expect(isByeMatch({ homeTeam: 'Free', awayTeam: 'TEST A' })).toBeTrue();
    expect(restingTeam({ homeTeam: 'Free', awayTeam: 'TEST A' })).toBe('TEST A');
  });
  it('usa el flag del backend para un rival dado de baja', () => {
    const m = { homeTeam: 'TEST Baja', awayTeam: 'TEST B', isBye: true, restingTeam: 'TEST B' };
    expect(isByeMatch(m)).toBeTrue();
    expect(restingTeam(m)).toBe('TEST B');
  });
  it('un partido normal no es libre', () => {
    expect(isByeMatch({ homeTeam: 'TEST A', awayTeam: 'TEST B', isBye: false })).toBeFalse();
    expect(restingTeam({ homeTeam: 'TEST A', awayTeam: 'TEST B', isBye: false })).toBeNull();
  });
});

describe('clasificación a playoffs (plan 22/10 #2)', () => {
  it('no ofrece equipos dados de baja', () => {
    const r = playoffEligible([{ name: 'A', isActive: true }, { name: 'B', isActive: false }, { name: 'C' }]);
    expect(r.map(x => x.name)).toEqual(['A', 'C']);
  });
});
