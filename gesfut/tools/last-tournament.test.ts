import test from 'node:test';
import assert from 'node:assert/strict';
import { getLastTournament, setLastTournament, forgetLastTournament } from '../src/app/core/utils/last-tournament';

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

test('migra las claves globales viejas una sola vez', () => {
  const local = mem(); const a = user('Ana', 'Uno');
  local.setItem('lastTournamentClicked', 'viejo'); local.setItem('lastTournamentClickedName', 'Liga vieja');
  assert.deepEqual(getLastTournament(local, a), { code: 'viejo', name: 'Liga vieja' });
  assert.equal(local.getItem('lastTournamentClicked'), null);
  assert.equal(getLastTournament(local, a)?.code, 'viejo');
});
