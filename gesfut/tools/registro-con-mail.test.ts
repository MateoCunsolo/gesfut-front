import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAIL_VERIFICATION_ENABLED, REGISTERED_ALERT, REGISTERED_NOTICE, SHOW_RESEND_AFTER_REGISTER } from '../src/app/auth/auth-messages';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
test('verificacion por mail activa: textos y reenvio visibles', () => {
  assert.equal(MAIL_VERIFICATION_ENABLED, true);
  assert.equal(REGISTERED_ALERT, 'Cuenta creada. Te enviamos un mail para verificarla.');
  assert.match(REGISTERED_NOTICE, /Te enviamos un mail para verificar tu cuenta/);
  for (const t of [REGISTERED_ALERT, REGISTERED_NOTICE]) assert.match(t, /verific/i);
  assert.equal(SHOW_RESEND_AFTER_REGISTER, true);
});
test('componentes usan las constantes, sin texto viejo', () => {
  const reg = read('../src/app/auth/register/register.component.ts');
  const lts = read('../src/app/auth/login/login.component.ts');
  const lhtml = read('../src/app/auth/login/login.component.html');
  assert.match(reg, /successAlert\(REGISTERED_ALERT\)/);
  assert.match(lts, /showResend: boolean = this\.registeredNotice && SHOW_RESEND_AFTER_REGISTER/);
  assert.match(lhtml, /\{\{ registeredNoticeText \}\}/);
  for (const s of [reg, lhtml]) assert.doesNotMatch(s, /Te enviamos un mail/);
});
