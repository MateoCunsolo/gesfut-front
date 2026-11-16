import test from 'node:test';
import assert from 'node:assert/strict';
import { ADD_PLAYER_FORBIDDEN_MESSAGE, addPlayerForbiddenMessage } from '../src/app/core/utils/add-player-access';

test('un 403 de getTeam al agregar jugador devuelve un mensaje claro', () => {
  const msg = addPlayerForbiddenMessage(403);
  assert.equal(typeof msg, 'string');
  assert.ok((msg ?? '').length > 0);
  assert.equal(msg, ADD_PLAYER_FORBIDDEN_MESSAGE);
  assert.equal(msg?.includes('403'), false);
  assert.equal(addPlayerForbiddenMessage(401), null);
  assert.equal(addPlayerForbiddenMessage(500), null);
  assert.equal(addPlayerForbiddenMessage(undefined), null);
  assert.equal(addPlayerForbiddenMessage(null), null);
});
