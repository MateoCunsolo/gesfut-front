import test from 'node:test';
import assert from 'node:assert/strict';
import { sessionAccountFingerprint, sessionAccountChanged, writeSessionAccount, readSessionAccount, parseSessionAccount, SESSION_ACCOUNT_KEY } from '../src/app/core/utils/session-account';

test('la huella distingue cuentas y no dispara si una esta vacia', () => {
  const a = sessionAccountFingerprint({ email: 'qa.a@example.test', name: 'Ana', lastName: 'Uno' });
  const b = sessionAccountFingerprint({ email: 'qa.b@example.test', name: 'Ana', lastName: 'Uno' });
  assert.ok(a);
  assert.notEqual(a, b);
  assert.equal(sessionAccountChanged(a, b), true);
  assert.equal(sessionAccountChanged(a, a), false);
  assert.equal(sessionAccountChanged(a, ''), false);
  assert.equal(sessionAccountChanged('', b), false);
});

test('localStorage compartido guarda y lee la huella', () => {
  const mem = new Map<string, string>();
  const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); }, removeItem: (k: string) => { mem.delete(k); } };
  const fp = sessionAccountFingerprint({ email: 'qa.a@example.test', name: 'Ana', lastName: 'Uno' });
  writeSessionAccount(storage, fp);
  assert.equal(readSessionAccount(storage), fp);
  assert.equal(mem.get(SESSION_ACCOUNT_KEY), fp);
  writeSessionAccount(storage, '');
  assert.equal(readSessionAccount(storage), '');
});

test('parseSessionAccount recupera email y nombre de la huella', () => {
  const user = { email: 'qa.a@example.test', name: 'Ana', lastName: 'Uno' };
  const parsed = parseSessionAccount(sessionAccountFingerprint(user));
  assert.deepEqual(parsed, { email: 'qa.a@example.test', name: 'Ana', lastName: 'Uno' });
  assert.equal(parseSessionAccount(''), null);
});
