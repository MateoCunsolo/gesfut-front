import test from 'node:test';
import assert from 'node:assert/strict';
import { tournamentNameHasForbiddenChars, TOURNAMENT_NAME_FORBIDDEN_MESSAGE } from '../src/app/core/utils/tournament-name';

test('el nombre del torneo rechaza < y >', () => {
  assert.equal(tournamentNameHasForbiddenChars('Copa Apertura 2026'), false);
  assert.equal(tournamentNameHasForbiddenChars('A < B'), true);
  assert.equal(tournamentNameHasForbiddenChars('A > B'), true);
  assert.equal(tournamentNameHasForbiddenChars('<script>'), true);
  assert.ok(TOURNAMENT_NAME_FORBIDDEN_MESSAGE.includes('<') || TOURNAMENT_NAME_FORBIDDEN_MESSAGE.includes('>'));
});
