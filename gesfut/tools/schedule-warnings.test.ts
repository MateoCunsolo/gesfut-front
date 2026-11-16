import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseMatchDateTime } from '../src/app/core/utils/can-load-result';
import { collectScheduleWarnings, hasVenueClash, previousDayStillOpen, VENUE_CLASH_MESSAGE } from '../src/app/core/utils/schedule-warnings';

const stamp = 'lun 16 de nov 2026 | 12:30 hs';
const t = parseMatchDateTime(stamp)!;

test('aviso de cancha: misma fecha, hora y cancha', () => {
  const others = [
    { id: 2, dateTime: stamp, description: 'Cancha 1' },
    { id: 3, dateTime: 'lun 16 de nov 2026 | 13:30 hs', description: 'Cancha 1' },
  ];
  assert.equal(hasVenueClash(t, '1', others, [1]), true);
  assert.equal(hasVenueClash(t, 'Cancha 2', others, [1]), false);
  assert.equal(hasVenueClash(t, 'Cancha 1', others, [2]), false); // se ignora el propio
});

test('aviso de Fecha N-1 abierta usa el numero real', () => {
  const days = [
    { numberOfMatchDay: 0, isFinished: false, matches: [] },
    { numberOfMatchDay: 1, isFinished: false, matches: [] },
  ];
  assert.equal(previousDayStillOpen(days, 1), 'La Fecha 1 todav\u00eda no est\u00e1 cerrada.');
  assert.equal(previousDayStillOpen(days, 0), null);
  assert.equal(previousDayStillOpen([{ numberOfMatchDay: 0, isFinished: true }, { numberOfMatchDay: 1, isFinished: false }], 1), null);
});

test('collect junta avisos no bloqueantes', () => {
  const days = [
    { numberOfMatchDay: 0, isFinished: false, matches: [] },
    { numberOfMatchDay: 1, isFinished: false, matches: [] },
  ];
  const messages = collectScheduleWarnings({
    chosen: t,
    venue: 'Cancha 1',
    allMatches: [{ id: 9, dateTime: stamp, description: '1' }],
    ignoreIds: [4],
    days,
    currentNumberOfMatchDay: 1,
  });
  assert.deepEqual(messages, [VENUE_CLASH_MESSAGE, 'La Fecha 1 todav\u00eda no est\u00e1 cerrada.']);
});

test('timePicker usa 24 h, no oculta horas pasadas y avisa sin bloquear', () => {
  const ts = readFileSync(new URL('../src/app/admin/match-day/list-match-days/timePicker/timePicker.component.ts', import.meta.url), 'utf8');
  assert.match(ts, /hourCycle: 'h23'/);
  assert.match(ts, /confirmScheduleWarnings/);
  assert.match(ts, /Continuar/);
  assert.doesNotMatch(ts, /minTime|filterPast|ocultar horas/);
  const html = readFileSync(new URL('../src/app/admin/match-day/list-match-days/list-match-days.component.html', import.meta.url), 'utf8');
  assert.match(html, /Sin horario: se puede cargar el resultado/);
  const card = readFileSync(new URL('../src/app/shared/match-card/match-card.component.ts', import.meta.url), 'utf8');
  assert.match(card, /Horario por confirmar/);
});
