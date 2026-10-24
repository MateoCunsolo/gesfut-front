import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { authErrorMessage, isRegisteredNotice } from '../src/app/auth/auth-messages';

const fb = 'FALLBACK';
test('usa el mensaje del backend en 4xx', () => {
  assert.equal(authErrorMessage({ status: 401, error: { error: 'Email o contraseña incorrectos.' } }, fb), 'Email o contraseña incorrectos.');
  assert.equal(authErrorMessage({ status: 400, error: { message: 'Dato inválido' } }, fb), 'Dato inválido');
  assert.equal(authErrorMessage({ status: 400, error: { errors: { name: 'Nombre es requerido', lastName: 'Apellido es requerido' } } }, fb), 'Nombre es requerido. Apellido es requerido');
});
test('fallback si no hay mensaje util', () => {
  for (const e of [{ status: 401, error: null }, { status: 403, error: 'Invalid CORS request' }, { status: 403, error: 'Forbidden' }, { status: 404, error: '<html>x</html>' }, { status: 400, error: {} }])
    assert.equal(authErrorMessage(e, fb), fb);
});
test('5xx nunca muestra el texto del backend', () => {
  const m = authErrorMessage({ status: 500, error: { error: 'NullPointerException en X' } }, fb);
  assert.match(m, /problema en el servidor/); assert.doesNotMatch(m, /NullPointer/);
});
test('sin conexion', () => {
  assert.match(authErrorMessage({ status: 0 }, fb), /No pudimos conectar/);
  assert.match(authErrorMessage(undefined, fb), /No pudimos conectar/);
});
test('aviso registered=1 en el login', () => {
  assert.equal(isRegisteredNotice('?registered=1'), true);
  assert.equal(isRegisteredNotice('?expired=1&registered=1'), true);
  assert.equal(isRegisteredNotice(''), false);
  assert.equal(isRegisteredNotice('?registered=0'), false);
  const html = readFileSync(new URL('../src/app/auth/login/login.component.html', import.meta.url), 'utf8');
  assert.match(html, /@if \(registeredNotice\)[^]*Te enviamos un mail para verificar tu cuenta\. Verificalo y después iniciá sesión\./);
  const reg = readFileSync(new URL('../src/app/auth/register/register.component.ts', import.meta.url), 'utf8');
  assert.match(reg, /navigateByUrl\('\/auth\/login\?registered=1'\)/);
});
