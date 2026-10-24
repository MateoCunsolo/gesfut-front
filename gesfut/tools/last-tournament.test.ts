import test from 'node:test';
import assert from 'node:assert/strict';
import { getLastTournament, setLastTournament, forgetLastTournament } from '../src/app/core/utils/last-tournament';
import { httpErrorMessage } from '../src/app/core/utils/http-error';
import { parseDmyTime } from '../src/app/core/utils/date-input';
import { tournamentPublicLink } from '../src/app/core/utils/share-tournament';

function mem() { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } }; }
function user(name: string, last: string) { const s = mem(); s.setItem('name', name); s.setItem('lastName', last); return s; }

test('cada cuenta ve solo su último torneo en el mismo navegador', () => {
  const local = mem(); const ana = user('Ana', 'Uno'); const beto = user('Beto', 'Dos');
  setLastTournament('code-ana', 'Liga Ana', local, ana);
  assert.deepEqual(getLastTournament(local, ana), { code: 'code-ana', name: 'Liga Ana' });
  assert.equal(getLastTournament(local, beto), null);
  setLastTournament('code-beto', 'Copa Beto', local, beto);
  assert.equal(getLastTournament(local, ana)?.code, 'code-ana');
  assert.equal(getLastTournament(local, beto)?.code, 'code-beto');
});

test('olvidar borra el del usuario y las claves viejas', () => {
  const local = mem(); const ana = user('Ana', 'Uno');
  setLastTournament('c', 'n', local, ana);
  forgetLastTournament(local, ana);
  assert.equal(getLastTournament(local, ana), null);
  assert.equal(local.getItem('lastTournamentClicked'), null);
});

test('valor corrupto no rompe', () => {
  const local = mem(); const ana = user('Ana', 'Uno');
  local.setItem('lastTournament:ana|uno', '{no json');
  assert.equal(getLastTournament(local, ana), null);
});

test('con email en la sesión la clave es por email y no se escriben claves globales', () => {
  const local = mem(); const a = user('Ana', 'Uno'); a.setItem('email', 'Ana@X.com'); const b = user('Ana', 'Uno'); b.setItem('email', 'otra@x.com');
  setLastTournament('c1', 'n1', local, a);
  assert.equal(getLastTournament(local, a)?.code, 'c1');
  assert.equal(getLastTournament(local, b), null, 'mismo nombre, otra cuenta');
  assert.equal(local.getItem('lastTournamentClicked'), null);
  assert.equal(local.getItem('lastTournamentClickedName'), null);
});

test('claves globales viejas: se borran sin adoptarse', () => {
  const local = mem(); const a = user('Ana', 'Uno');
  local.setItem('lastTournamentClicked', 'viejo'); local.setItem('lastTournamentClickedName', 'Liga vieja');
  assert.equal(getLastTournament(local, a), null);
  assert.equal(local.getItem('lastTournamentClicked'), null);
  assert.equal(local.getItem('lastTournamentClickedName'), null);
  assert.equal(local.getItem('lastTournament:ana|uno'), null);
});

test('httpErrorMessage muestra el mensaje del servidor (400 y 429) y si no, el generico', () => {
  assert.equal(httpErrorMessage({ status: 400, error: { error: 'El DNI 123 ya está en el equipo X' } }, 'gen'), 'El DNI 123 ya está en el equipo X');
  assert.equal(httpErrorMessage({ status: 429, error: { error: 'Demasiados intentos. Esperá unos minutos.' } }, 'gen'), 'Demasiados intentos. Esperá unos minutos.');
  assert.equal(httpErrorMessage({ status: 400, error: { message: 'm' } }, 'gen'), 'm');
  assert.equal(httpErrorMessage({ status: 500, error: null }, 'gen'), 'gen');
});

test('link de compartir usa el codigo', () => {
  assert.equal(tournamentPublicLink('abc-1', 'https://x.test'), 'https://x.test/abc-1');
});

test('fecha de playoffs dd/mm/aaaa', () => {
  assert.equal(parseDmyTime('05/11/2026', '20:30'), '2026-11-05T20:30:00');
  assert.equal(parseDmyTime('31/02/2026', '20:00'), null);
  assert.equal(parseDmyTime('11/05/26', '20:00'), null);
  assert.equal(parseDmyTime('05/11/2026', '25:00'), null);
});
