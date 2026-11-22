import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { authErrorMessage, isRegisteredNotice, resendMessage, resendTooManyMessage, retryAfterMinutes, retryAfterFromError, RESEND_NEUTRAL, RESEND_TOO_MANY, NETWORK_ERROR, SERVER_ERROR, LOGIN_BAD_CREDENTIALS, SIGNUP_EMAIL_TAKEN, SIGNUP_SUCCESS, SESSION_EXPIRED } from '../src/app/auth/auth-messages';

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
  assert.equal(m, SERVER_ERROR); assert.doesNotMatch(m, /NullPointer/);
});
test('sin conexion', () => {
  assert.equal(authErrorMessage({ status: 0 }, fb), NETWORK_ERROR);
  assert.equal(authErrorMessage(undefined, fb), NETWORK_ERROR);
});
test('aviso registered=1 en el login', () => {
  assert.equal(isRegisteredNotice('?registered=1'), true);
  assert.equal(isRegisteredNotice('?expired=1&registered=1'), true);
  assert.equal(isRegisteredNotice(''), false);
  assert.equal(isRegisteredNotice('?registered=0'), false);
  const html = readFileSync(new URL('../src/app/auth/login/login.component.html', import.meta.url), 'utf8');
  // Verificacion por mail activa: el aviso sale de REGISTERED_NOTICE (ver registro-con-mail.test.ts).
  assert.match(html, /@if \(registeredNotice\)[^]*\{\{ registeredNoticeText \}\}/);
  const reg = readFileSync(new URL('../src/app/auth/register/register.component.ts', import.meta.url), 'utf8');
  assert.match(reg, /navigateByUrl\('\/auth\/login\?registered=1'\)/);
});

test('bloque A: toasts nunca vacios, revisar antes de generar, intervalo minimo 1', () => {
  const src = (p: string) => readFileSync(new URL('../src/app/' + p, import.meta.url), 'utf8');
  assert.match(src('core/services/alert.service.ts'), /const text = typeof err === 'string' && err\.trim\(\) \? err :/);
  const ini = src('admin/initialize-tournament/initialize-tournament.component.ts');
  assert.match(ini, /checkTeams\(initializeRequest\)/);
  assert.match(ini, /al menos 1 d/);
  const tp = src('admin/match-day/list-match-days/timePicker/timePicker.component.ts');
  assert.match(tp, /min="1"[^>]*plusDays/);
  for (const f of ['admin/initialize-tournament/initialize-tournament.component.ts', 'admin/match-day/list-match-days/list-match-days.component.ts', 'admin/match-day/list-match-days/timePicker/timePicker.component.ts'])
    assert.doesNotMatch(src(f), /errorAlert\(\w+\.error\.error\)/, f);
});

test('bloque A: fecha elegida se mantiene, playoffs accesibles, refresco tras baja/alta', () => {
  const src = (p: string) => readFileSync(new URL('../src/app/' + p, import.meta.url), 'utf8');
  const lmd = src('admin/match-day/list-match-days/list-match-days.component.ts');
  assert.match(lmd, /fixtureRound:/); assert.match(lmd, /const kept = this\.keptRound\(\)/);
  assert.match(lmd, /qualifyCountAlert\(this\.tournament\.participants\.length\)/);
  const al = src('core/services/alert.service.ts');
  assert.match(al, /input: 'select'[^]*'aria-label'/); assert.match(al, /confirmButtonAriaLabel: `Generar \$\{roundName\}`/);
  const tr = src('core/services/tournament/team-removal.service.ts');
  assert.equal((tr.match(/this\.refreshOpenTournament\(\);/g) || []).length, 2);
  assert.match(tr, /'Equipo habilitado'/);
});

test('bloque B: reenviar mail neutral, cooldown 60 s y 429 con voseo', () => {
  assert.equal(resendMessage({ message: 'Si el mail existe y falta verificarlo, te lo mandamos.' }), 'Si el mail existe y falta verificarlo, te lo mandamos.');
  assert.equal(resendMessage(null), RESEND_NEUTRAL);
  assert.equal(RESEND_TOO_MANY, 'Pediste demasiados reenvíos. Probá de nuevo más tarde.');
  assert.equal(resendTooManyMessage(null), RESEND_TOO_MANY);
  assert.equal(resendTooManyMessage(''), RESEND_TOO_MANY);
  assert.equal(resendTooManyMessage('3600'), 'Pediste demasiados reenvíos. Probá de nuevo en 60 minutos.');
  assert.equal(resendTooManyMessage(60), 'Pediste demasiados reenvíos. Probá de nuevo en 1 minuto.');
  assert.equal(resendTooManyMessage(30), 'Pediste demasiados reenvíos. Probá de nuevo en 1 minuto.');
  assert.equal(retryAfterMinutes('3600'), 60);
  assert.equal(retryAfterMinutes('no-un-numero'), null);
  assert.equal(retryAfterFromError({ headers: { get: (n: string) => n.toLowerCase() === 'retry-after' ? '3600' : null } }), '3600');
  assert.equal(retryAfterFromError({}), null);
  const ts = readFileSync(new URL('../src/app/auth/login/login.component.ts', import.meta.url), 'utf8');
  assert.match(ts, /startResendCooldown\(60\)/); assert.match(ts, /status === 429 \? resendTooManyMessage\(retryAfterFromError\(err\)\)/);
  assert.match(ts, /protected showResend: boolean = this\.registeredNotice/); assert.match(ts, /this\.showResend = true/);
  const html = readFileSync(new URL('../src/app/auth/login/login.component.html', import.meta.url), 'utf8');
  assert.match(html, /@if \(showResend\)[^]*\[disabled\]="resendCooldown > 0"/);
  const ve = readFileSync(new URL('../src/app/auth/register/verify-email/verify-email.component.ts', import.meta.url), 'utf8');
  assert.match(ve, /resendTooManyMessage\(retryAfterFromError\(error\)\)/);
});

test('textos de login y alta segun la spec', () => {
  assert.equal(LOGIN_BAD_CREDENTIALS, 'El correo o la contrase\u00f1a no coinciden. Revisalos y prob\u00e1 de nuevo.');
  assert.equal(SIGNUP_EMAIL_TAKEN.startsWith('Ya hay una cuenta con este correo.'), true);
  assert.equal(SIGNUP_SUCCESS, '\u00a1Listo! Tu cuenta est\u00e1 creada. Ya pod\u00e9s armar tu torneo.');
  assert.equal(SESSION_EXPIRED, 'Tu sesi\u00f3n venci\u00f3. Volv\u00e9 a ingresar para seguir.');
  const login = readFileSync(new URL('../src/app/auth/login/login.component.html', import.meta.url), 'utf8');
  const loginTs = readFileSync(new URL('../src/app/auth/login/login.component.ts', import.meta.url), 'utf8');
  const regHtml = readFileSync(new URL('../src/app/auth/register/register.component.html', import.meta.url), 'utf8');
  const regTs = readFileSync(new URL('../src/app/auth/register/register.component.ts', import.meta.url), 'utf8');
  assert.match(login, /form-alert-slot/);
  assert.match(login, /LOGIN_PASSWORD_REQUIRED/);
  assert.match(login, /LOGIN_BAD_CREDENTIALS/);
  assert.match(loginTs, /markAllAsTouched/);
  assert.match(login, /Ingresando/);
  assert.match(regHtml, /fieldServerError\['email'\]/);
  assert.match(regHtml, /Creando cuenta/);
  assert.match(regHtml, /showPasswordHelp\(\)/);
  assert.match(regTs, /markAllAsTouched/);
  assert.match(regTs, /SIGNUP_EMAIL_TAKEN/);
});
