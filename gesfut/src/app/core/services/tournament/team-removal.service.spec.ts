import { deletionConfirmText } from './team-removal.service';
import { TeamDeletionResponse } from './team.service';

describe('Eliminar equipo: texto de confirmación (plan 22/10 #2)', () => {
  const base: TeamDeletionResponse = { teamId: 1, teamName: 'TEST A', action: 'DELETE', ongoingTournaments: [], blockedReason: null, message: null };
  it('si nunca jugó avisa que se borra definitivamente', () => {
    const c = deletionConfirmText(base);
    expect(c.text).toContain('borrar definitivamente');
    expect(c.button).toBe('Eliminar definitivamente');
  });
  it('si tiene historial avisa que se deshabilita y se conservan los resultados', () => {
    const c = deletionConfirmText({ ...base, action: 'DISABLE' });
    expect(c.text).toContain('se va a deshabilitar');
    expect(c.text).toContain('se conservan');
    expect(c.text).not.toContain('torneo en curso');
    expect(c.button).toBe('Deshabilitar equipo');
  });
  it('nombra los torneos en curso y la fecha libre del rival', () => {
    const c = deletionConfirmText({ ...base, action: 'DISABLE', ongoingTournaments: ['TEST Liga'] });
    expect(c.text).toContain('TEST Liga');
    expect(c.text).toContain('fecha libre');
  });
});
