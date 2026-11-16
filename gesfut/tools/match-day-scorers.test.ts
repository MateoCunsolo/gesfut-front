import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateMatchDayScorers } from '../src/app/core/utils/match-day-scorers';

test('goleadores de la fecha no juntan homonimos: se agrupa por id y se muestra el equipo', () => {
  const matches = [
    { events: [{ type: 'GOAL', playerName: 'Test1 QA', teamName: 'QA Diecisiete', idPlayerParticipant: 11, quantity: 2 }] },
    { events: [{ type: 'GOAL', playerName: 'Test1 QA', teamName: 'QA Quince', idPlayerParticipant: 22, quantity: 1 }] },
  ];
  const list = aggregateMatchDayScorers(matches);
  assert.equal(list.length, 2);
  assert.equal(list[0].goals, 2);
  assert.equal(list[0].teamName, 'QA Diecisiete');
  assert.equal(list[1].goals, 1);
  assert.equal(list[1].teamName, 'QA Quince');
  assert.equal(list[0].showTeam, true);
  assert.equal(list[1].showTeam, true);
  assert.notEqual(list[0].playerId, list[1].playerId);
});
