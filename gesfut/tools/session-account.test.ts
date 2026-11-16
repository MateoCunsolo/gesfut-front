import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256HexUtf8 } from '../src/app/core/utils/sha256';
import {
  sessionAccountHash,
  sessionAccountChanged,
  writeSessionAccount,
  readSessionAccount,
  clearSessionAccountOnExpire,
  applyMeToSessionStorage,
  applyAccountSwitchReload,
  adminRouteAllowed,
  adminReloadWouldBounce,
  SESSION_ACCOUNT_KEY,
  SESSION_ACCOUNT_HASH_RE,
  ME_NETWORK_MESSAGE,
} from '../src/app/core/utils/session-account';

function memStorage(initial: Record<string, string> = {}) {
  const mem = new Map<string, string>(Object.entries(initial));
  return {
    mem,
    storage: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => { mem.set(k, v); },
      removeItem: (k: string) => { mem.delete(k); },
    },
  };
}

test('la huella es un hash SHA-256 del email, sin nombre ni role, e igual con mayusculas o espacios', async () => {
  const a = await sessionAccountHash('qa.a@example.test');
  const same = await sessionAccountHash('  QA.A@EXAMPLE.TEST  ');
  const b = await sessionAccountHash('qa.b@example.test');
  assert.match(a, SESSION_ACCOUNT_HASH_RE);
  assert.equal(a, same);
  assert.notEqual(a, b);
  assert.equal(a.includes('qa.a@example.test'), false);
  assert.equal(a.toLowerCase().includes('ana'), false);
  assert.equal(a.includes('MANAGER'), false);
  assert.equal(await sessionAccountHash(''), '');
  assert.equal(sessionAccountChanged(a, b), true);
  assert.equal(sessionAccountChanged(a, a), false);
  assert.equal(sessionAccountChanged(a, ''), false);
  assert.equal(sessionAccountChanged('', b), false);
});

test('el fallback sincrono de SHA-256 coincide con crypto.subtle y con vectores conocidos', async () => {
  assert.equal(sha256HexUtf8(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256HexUtf8('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const email = 'qa.a@example.test';
  assert.equal(sha256HexUtf8(email), await sessionAccountHash(email));
});

test('localStorage compartido guarda solo el hash, nunca el email ni el nombre', async () => {
  const { mem, storage } = memStorage();
  const hash = await sessionAccountHash('qa.a@example.test');
  writeSessionAccount(storage, hash);
  assert.equal(readSessionAccount(storage), hash);
  assert.equal(mem.get(SESSION_ACCOUNT_KEY), hash);
  assert.equal(hash.includes('qa.a@example.test'), false);
  writeSessionAccount(storage, '');
  assert.equal(readSessionAccount(storage), '');
});

test('al leer la huella se borra cualquier valor que no sea un SHA-256 hex de 64 caracteres', () => {
  const { mem, storage } = memStorage({ [SESSION_ACCOUNT_KEY]: 'qa.viejo@example.test' });
  assert.equal(readSessionAccount(storage), '');
  assert.equal(mem.has(SESSION_ACCOUNT_KEY), false);

  const { mem: mem2, storage: s2 } = memStorage({ [SESSION_ACCOUNT_KEY]: 'ABCD' + 'e'.repeat(60) });
  assert.equal(readSessionAccount(s2), '');
  assert.equal(mem2.has(SESSION_ACCOUNT_KEY), false);

  const { mem: mem3, storage: s3 } = memStorage({ [SESSION_ACCOUNT_KEY]: 'a'.repeat(64) });
  assert.equal(readSessionAccount(s3), 'a'.repeat(64));
  assert.equal(mem3.get(SESSION_ACCOUNT_KEY), 'a'.repeat(64));
});

test('al vencer la sesion se borran la huella y sessionStorage.email', async () => {
  const local = memStorage({ [SESSION_ACCOUNT_KEY]: await sessionAccountHash('qa.a@example.test') });
  const session = memStorage({ email: 'qa.a@example.test', name: 'Ana', role: 'MANAGER' });
  clearSessionAccountOnExpire(local.storage, session.storage);
  assert.equal(readSessionAccount(local.storage), '');
  assert.equal(session.mem.has('email'), false);
  assert.equal(session.mem.get('name'), 'Ana');
  assert.equal(session.mem.get('role'), 'MANAGER');
});

test('Recargar con /me 200 refresca identidad y huella, sin guardar el role en la huella', async () => {
  const session = memStorage({
    email: 'viejo@example.test',
    name: 'Viejo',
    lastName: 'Uno',
    role: 'MANAGER',
    token: 'cookie',
  });
  const local = memStorage({ [SESSION_ACCOUNT_KEY]: await sessionAccountHash('viejo@example.test') });
  const me = { email: 'nuevo@example.test', name: 'Nueva', lastName: 'Dos', role: 'MANAGER' };
  const outcome = await applyAccountSwitchReload({
    fetchMe: async () => ({ status: 200, body: me }),
    session: session.storage,
    local: local.storage,
  });
  assert.equal(outcome, 'updated');
  assert.equal(session.mem.get('email'), 'nuevo@example.test');
  assert.equal(session.mem.get('name'), 'Nueva');
  assert.equal(session.mem.get('lastName'), 'Dos');
  assert.equal(session.mem.get('role'), 'MANAGER');
  assert.equal(session.mem.get('token'), 'cookie');
  const expected = await sessionAccountHash('nuevo@example.test');
  assert.equal(readSessionAccount(local.storage), expected);
  assert.equal(expected.includes('MANAGER'), false);
  assert.equal(expected.includes('nuevo@example.test'), false);
});

test('Recargar con /me 401 no modifica identidad ni huella (el caller limpia y manda al login)', async () => {
  const session = memStorage({ email: 'viejo@example.test', name: 'Viejo', lastName: 'Uno', role: 'MANAGER', token: 'cookie' });
  const hash = await sessionAccountHash('viejo@example.test');
  const local = memStorage({ [SESSION_ACCOUNT_KEY]: hash });
  const outcome = await applyAccountSwitchReload({
    fetchMe: async () => ({ status: 401 }),
    session: session.storage,
    local: local.storage,
  });
  assert.equal(outcome, 'unauthorized');
  assert.equal(session.mem.get('email'), 'viejo@example.test');
  assert.equal(session.mem.get('role'), 'MANAGER');
  assert.equal(readSessionAccount(local.storage), hash);
});

test('Recargar ante red o 5xx no limpia nada y el caller muestra un mensaje', async () => {
  const session = memStorage({ email: 'viejo@example.test', name: 'Viejo', lastName: 'Uno', role: 'MANAGER', token: 'cookie' });
  const hash = await sessionAccountHash('viejo@example.test');
  const local = memStorage({ [SESSION_ACCOUNT_KEY]: hash });

  const net = await applyAccountSwitchReload({
    fetchMe: async () => { throw new Error('Failed to fetch'); },
    session: session.storage,
    local: local.storage,
  });
  assert.equal(net, 'error');

  const five = await applyAccountSwitchReload({
    fetchMe: async () => ({ status: 503 }),
    session: session.storage,
    local: local.storage,
  });
  assert.equal(five, 'error');
  assert.equal(session.mem.get('email'), 'viejo@example.test');
  assert.equal(session.mem.get('name'), 'Viejo');
  assert.equal(session.mem.get('role'), 'MANAGER');
  assert.equal(session.mem.get('token'), 'cookie');
  assert.equal(readSessionAccount(local.storage), hash);
  assert.ok(ME_NETWORK_MESSAGE.length > 0);
});

test('Recargar en /admin no rebota entre adminAuthGuard e isAuthGuard: /me deja el role antes de recargar', async () => {
  const session = memStorage({ email: 'viejo@example.test', name: 'Viejo', lastName: 'Uno', role: 'MANAGER', token: 'cookie' });
  const local = memStorage();
  const me = { email: 'nuevo@example.test', name: 'Nueva', lastName: 'Dos', role: 'MANAGER' };
  const outcome = await applyAccountSwitchReload({
    fetchMe: async () => ({ status: 200, body: me }),
    session: session.storage,
    local: local.storage,
  });
  assert.equal(outcome, 'updated');
  const isAuthenticated = session.mem.get('token') === 'cookie';
  const role = session.mem.get('role') ?? '';
  assert.equal(adminRouteAllowed(isAuthenticated, role), true);
  assert.equal(adminReloadWouldBounce(isAuthenticated, role), false);
  // El camino viejo (limpiar role y recargar en /admin) rebotaria:
  assert.equal(adminReloadWouldBounce(true, ''), true);
  assert.equal(adminRouteAllowed(true, ''), false);
});
