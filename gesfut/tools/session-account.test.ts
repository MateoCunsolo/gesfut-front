import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sessionAccountHash,
  sessionAccountChanged,
  writeSessionAccount,
  readSessionAccount,
  clearSessionAccountOnExpire,
  clearStaleUiIdentity,
  SESSION_ACCOUNT_KEY,
} from '../src/app/core/utils/session-account';

test('la huella es un hash SHA-256 del email, sin nombre, e igual con mayusculas o espacios', async () => {
  const a = await sessionAccountHash('qa.a@example.test');
  const same = await sessionAccountHash('  QA.A@EXAMPLE.TEST  ');
  const b = await sessionAccountHash('qa.b@example.test');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, same);
  assert.notEqual(a, b);
  assert.equal(a.includes('qa.a@example.test'), false);
  assert.equal(a.toLowerCase().includes('ana'), false);
  assert.equal(await sessionAccountHash(''), '');
  assert.equal(sessionAccountChanged(a, b), true);
  assert.equal(sessionAccountChanged(a, a), false);
  assert.equal(sessionAccountChanged(a, ''), false);
  assert.equal(sessionAccountChanged('', b), false);
});

test('localStorage compartido guarda solo el hash, nunca el email ni el nombre', async () => {
  const mem = new Map<string, string>();
  const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); }, removeItem: (k: string) => { mem.delete(k); } };
  const hash = await sessionAccountHash('qa.a@example.test');
  writeSessionAccount(storage, hash);
  assert.equal(readSessionAccount(storage), hash);
  assert.equal(mem.get(SESSION_ACCOUNT_KEY), hash);
  assert.equal(hash.includes('qa.a@example.test'), false);
  writeSessionAccount(storage, '');
  assert.equal(readSessionAccount(storage), '');
});

test('al vencer la sesion se borran la huella y sessionStorage.email', async () => {
  const localMem = new Map<string, string>([[SESSION_ACCOUNT_KEY, await sessionAccountHash('qa.a@example.test')]]);
  const sessionMem = new Map<string, string>([['email', 'qa.a@example.test'], ['name', 'Ana'], ['role', 'MANAGER']]);
  const local = { getItem: (k: string) => localMem.get(k) ?? null, setItem: (k: string, v: string) => { localMem.set(k, v); }, removeItem: (k: string) => { localMem.delete(k); } };
  const session = { getItem: (k: string) => sessionMem.get(k) ?? null, setItem: (k: string, v: string) => { sessionMem.set(k, v); }, removeItem: (k: string) => { sessionMem.delete(k); } };
  clearSessionAccountOnExpire(local, session);
  assert.equal(readSessionAccount(local), '');
  assert.equal(sessionMem.has('email'), false);
  assert.equal(sessionMem.get('name'), 'Ana');
  assert.equal(sessionMem.get('role'), 'MANAGER');
});

test('Recargar no deja el role ni la identidad viejos de esta pestana', () => {
  const sessionMem = new Map<string, string>([['email', 'qa.viejo@example.test'], ['name', 'Ana'], ['lastName', 'Uno'], ['role', 'MANAGER'], ['token', 'cookie']]);
  const session = { getItem: (k: string) => sessionMem.get(k) ?? null, setItem: (k: string, v: string) => { sessionMem.set(k, v); }, removeItem: (k: string) => { sessionMem.delete(k); } };
  clearStaleUiIdentity(session);
  assert.equal(sessionMem.has('role'), false);
  assert.equal(sessionMem.has('email'), false);
  assert.equal(sessionMem.has('name'), false);
  assert.equal(sessionMem.has('lastName'), false);
  assert.equal(sessionMem.get('token'), 'cookie');
});
