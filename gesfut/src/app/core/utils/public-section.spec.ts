import { archivedTournamentNavigation, publicSectionComponent, publicTournamentCommands } from './public-section';

describe('public-section', () => {
  it('Atras despues de abrir un torneo archivado vuelve a la lista (push, sin replaceUrl)', () => {
    const nav = archivedTournamentNavigation('abc123');
    expect(nav.commands).toEqual(['/', 'abc123']);
    expect(nav.extras.replaceUrl).toBeUndefined();
  });

  it('mapea /codigo/seccion y /codigo a secas', () => {
    expect(publicTournamentCommands('abc123', 'recap')).toEqual(['/', 'abc123']);
    expect(publicTournamentCommands('abc123', 'leaderboard')).toEqual(['/', 'abc123', 'tabla']);
    expect(publicSectionComponent('tabla')).toBe('leaderboard');
  });
});
