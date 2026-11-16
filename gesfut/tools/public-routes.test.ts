import test from 'node:test';
import assert from 'node:assert/strict';
import { archivedTournamentNavigation, publicSectionComponent, publicTournamentCommands } from '../src/app/core/utils/public-section';

test('la vista publica mapea /codigo/seccion y /codigo a secas', () => {
  assert.deepEqual(publicTournamentCommands('abc123', 'recap'), ['/', 'abc123']);
  assert.deepEqual(publicTournamentCommands('abc123', 'leaderboard'), ['/', 'abc123', 'tabla']);
  assert.deepEqual(publicTournamentCommands('abc123', 'match-days'), ['/', 'abc123', 'partidos']);
  assert.deepEqual(publicTournamentCommands('abc123', 'list-teams-tournament'), ['/', 'abc123', 'equipos']);
  assert.deepEqual(publicTournamentCommands('abc123', 'prizes'), ['/', 'abc123', 'premios']);
  assert.equal(publicSectionComponent(null), 'recap');
  assert.equal(publicSectionComponent(''), 'recap');
  assert.equal(publicSectionComponent('inicio'), 'recap');
  assert.equal(publicSectionComponent('tabla'), 'leaderboard');
  assert.equal(publicSectionComponent('Partidos'), 'match-days');
  assert.equal(publicSectionComponent('equipos'), 'list-teams-tournament');
  assert.equal(publicSectionComponent('premios'), 'prizes');
  assert.equal(publicSectionComponent('desconocida'), 'recap');
});

test('Atras despues de abrir un torneo archivado vuelve a la lista (push, sin replaceUrl)', () => {
  const nav = archivedTournamentNavigation('abc123');
  assert.deepEqual(nav.commands, ['/', 'abc123']);
  assert.equal('replaceUrl' in nav.extras, false);
  assert.notEqual((nav.extras as { replaceUrl?: boolean }).replaceUrl, true);
});
