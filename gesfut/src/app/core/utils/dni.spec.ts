import { isValidDni, normalizeDni } from './dni';

describe('dni (respuesta 1)', () => {
  it('es opcional', () => { expect(isValidDni('')).toBeTrue(); expect(normalizeDni('  ')).toBeNull(); });
  it('acepta puntos y valida largo', () => {
    expect(normalizeDni('30.123.456')).toBe('30123456');
    expect(isValidDni('30.123.456')).toBeTrue();
    expect(isValidDni('123')).toBeFalse();
  });
});
