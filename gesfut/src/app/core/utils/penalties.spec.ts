import { penaltiesLabel } from './penalties';

describe('penaltiesLabel (revisión crítica #9)', () => {
  it('muestra el resultado de la tanda', () => {
    expect(penaltiesLabel({ penaltiesHome: 4, penaltiesAway: 3 })).toBe('Definido por penales (4-3)');
  });
  it('sin penales devuelve null', () => {
    expect(penaltiesLabel({ penaltiesHome: null, penaltiesAway: null })).toBeNull();
    expect(penaltiesLabel(null)).toBeNull();
  });
});
