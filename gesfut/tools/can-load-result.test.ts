import test from 'node:test';
import assert from 'node:assert/strict';
import { canLoadResultFromDateTime, parseMatchDateTime, normalizeVenue, resultScheduleNotice } from '../src/app/core/utils/can-load-result';
import { readFileSync } from 'node:fs';

test('sin horario se puede cargar', () => {
  assert.equal(canLoadResultFromDateTime(null), true);
  assert.equal(canLoadResultFromDateTime(''), true);
  assert.equal(canLoadResultFromDateTime('   '), true);
});

test('formatMatchDate de es-ES se interpreta como hora de pared ART', () => {
  const d = parseMatchDateTime('dom 15 de nov 2026 | 20:00 hs');
  assert.ok(d);
  // 20:00 ART = 23:00 UTC
  assert.equal(d!.toISOString(), '2026-11-15T23:00:00.000Z');
  const iso = parseMatchDateTime('2026-11-15T20:00:00');
  assert.equal(iso!.toISOString(), '2026-11-15T23:00:00.000Z');
});

test('justo a la hora se puede cargar; un minuto antes no', () => {
  const stamp = 'dom 15 de nov 2026 | 20:00 hs';
  const at = new Date('2026-11-15T23:00:00.000Z');
  const before = new Date('2026-11-15T22:59:00.000Z');
  const after = new Date('2026-11-15T23:00:01.000Z');
  assert.equal(canLoadResultFromDateTime(stamp, at), true);
  assert.equal(canLoadResultFromDateTime(stamp, before), false);
  assert.equal(canLoadResultFromDateTime(stamp, after), true);
});

test('hora pasada queda recargable sin F5', () => {
  const stamp = 'dom 15 de nov 2026 | 20:00 hs';
  assert.equal(canLoadResultFromDateTime(stamp, new Date('2026-11-16T01:00:00.000Z')), true);
});

test('normalizeVenue iguala "1" y "Cancha 1"', () => {
  assert.equal(normalizeVenue('Cancha 1'), normalizeVenue('1'));
  assert.equal(normalizeVenue('  CANCHA 3 '), '3');
});


test('list-match-days actualiza canLoadResult al guardar la hora', () => {
  const ts = readFileSync(new URL('../src/app/admin/match-day/list-match-days/list-match-days.component.ts', import.meta.url), 'utf8');
  assert.match(ts, /matchFound\.canLoadResult = canLoadResultFromDateTime\(date\)/);
  assert.match(ts, /match\.canLoadResult = canLoadResultFromDateTime\(data\[index\]\.newDate\)/);
});

test('aviso al abrir el form usa el mismo texto que el back', () => {
  const stamp = 'dom 15 de nov 2026 | 20:00 hs';
  const before = new Date('2026-11-15T22:59:00.000Z');
  const at = new Date('2026-11-15T23:00:00.000Z');
  assert.equal(
    resultScheduleNotice(stamp, before),
    'Todav\u00eda no se puede cargar el resultado: el partido est\u00e1 programado para el 15/11/2026 a las 20:00 (hora de Argentina).'
  );
  assert.equal(resultScheduleNotice(stamp, at), null);
  assert.equal(resultScheduleNotice(null, before), null);
});
