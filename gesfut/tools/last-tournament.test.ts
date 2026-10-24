import test from 'node:test';
import assert from 'node:assert/strict';
import { getLastTournament, setLastTournament, forgetLastTournament } from '../src/app/core/utils/last-tournament';
import { mvpCandidates } from '../src/app/core/utils/mvp';
import { httpErrorMessage } from '../src/app/core/utils/http-error';
import { parseDmyTime } from '../src/app/core/utils/date-input';
import { tournamentPublicLink, whatsappShareUrl } from '../src/app/core/utils/share-tournament';

function mem() { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } }; }
/** Simula una pestaña: login guarda el email (minúsculas, como auth.service) y logout lo quita (como session.service). */
function tab() { return mem(); }
function login(s: ReturnType<typeof mem>, email: string) { s.setItem('email', email.trim().toLowerCase()); }
function logout(s: ReturnType<typeof mem>) { s.removeItem('email'); s.removeItem('name'); s.removeItem('lastName'); }

test('guardar -> logout -> login mismo email: sigue; otro email: no lo ve', () => {
  const local = mem(); const t = tab();
  login(t, 'Ana@X.com'); setLastTournament('code-ana', 'Liga', local, t);
  logout(t);
  assert.equal(getLastTournament(local, t), null, 'sin sesion no se muestra');
  assert.equal(local.getItem('lastTournament:ana@x.com'), 'code-ana', 'el logout no borra la clave');
  login(t, '  ANA@x.com '); assert.deepEqual(getLastTournament(local, t), { code: 'code-ana', name: '' });
  logout(t); login(t, 'beto@x.com'); assert.equal(getLastTournament(local, t), null, 'otro email no lo ve');
  setLastTournament('code-beto', '', local, t);
  logout(t); login(t, 'ana@x.com'); assert.equal(getLastTournament(local, t)?.code, 'code-ana');
});

test('solo se guarda el codigo; formato viejo {code,name} se migra a codigo', () => {
  const local = mem(); const t = tab(); login(t, 'a@x.com');
  setLastTournament('c1', 'Nombre secreto', local, t);
  assert.equal(local.getItem('lastTournament:a@x.com'), 'c1');
  local.setItem('lastTournament:a@x.com', JSON.stringify({ code: 'c2', name: 'n' }));
  assert.equal(getLastTournament(local, t)?.code, 'c2');
  assert.equal(local.getItem('lastTournament:a@x.com'), 'c2');
  local.setItem('lastTournament:a@x.com', '{no json');
  assert.equal(getLastTournament(local, t), null);
});

test('olvidar (torneo ajeno segun el servidor) borra solo la clave de ese email', () => {
  const local = mem(); const a = tab(); login(a, 'a@x.com'); const b = tab(); login(b, 'b@x.com');
  setLastTournament('ca', '', local, a); setLastTournament('cb', '', local, b);
  forgetLastTournament(local, a);
  assert.equal(getLastTournament(local, a), null);
  assert.equal(getLastTournament(local, b)?.code, 'cb');
});

test('sin email en la sesion no se guarda ni se muestra nada', () => {
  const local = mem(); const t = tab(); t.setItem('name', 'Ana'); t.setItem('lastName', 'Uno');
  setLastTournament('c', '', local, t);
  assert.equal(getLastTournament(local, t), null);
});

test('claves globales viejas: se borran sin adoptarse y no tocan la clave por email', () => {
  const local = mem(); const t = tab(); login(t, 'a@x.com');
  setLastTournament('mio', '', local, t);
  local.setItem('lastTournamentClicked', 'viejo'); local.setItem('lastTournamentClickedName', 'Liga vieja');
  assert.equal(getLastTournament(local, t)?.code, 'mio');
  assert.equal(local.getItem('lastTournamentClicked'), null);
  assert.equal(local.getItem('lastTournamentClickedName'), null);
  logout(t); login(t, 'nuevo@x.com');
  local.setItem('lastTournamentClicked', 'viejo');
  assert.equal(getLastTournament(local, t), null);
  assert.equal(local.getItem('lastTournamentClicked'), null);
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

test('WhatsApp: wa.me con texto y link publico codificados', () => {
  const u = whatsappShareUrl('abc-1', 'Liga & Copa', 'https://x.test');
  assert.ok(u.startsWith('https://wa.me/?text='));
  const text = decodeURIComponent(u.slice('https://wa.me/?text='.length));
  assert.ok(text.includes('Liga & Copa') && text.endsWith('https://x.test/abc-1'));
  assert.ok(!u.slice(20).includes('&'), 'texto codificado');
});

test('MVP de la fecha: candidatos = MVP cargados en los partidos (sin vacios ni repetidos)', () => {
  assert.deepEqual(mvpCandidates([{ mvpPlayer: 'Ana' }, { mvpPlayer: '' }, { mvpPlayer: null }, { mvpPlayer: ' Ana ' }, { mvpPlayer: 'Beto' }]), ['Ana', 'Beto']);
  assert.deepEqual(mvpCandidates([{ mvpPlayer: null }, {}]), [], 'sin MVP cargado no hay selector');
  assert.deepEqual(mvpCandidates(undefined), []);
});
