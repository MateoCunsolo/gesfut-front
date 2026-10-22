// Regresiones de las vistas P2 de acceso (09, 10, 11, 12, 20). Ejecutar: node tools/test-p2-acceso.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../src/app/auth/'+p,import.meta.url),'utf8');
const reg=src('register/register.component.html'), rec=src('reset-password/recive-email.component.ts'), rst=src('reset-password/reset-password.component.ts'), ver=src('register/verify-email/verify-email.component.ts');

test('09 registro: labels visibles, Mostrar/Ocultar, ayuda y CTA "Crear cuenta"',()=>{
  for(const f of ['name','lastName','email','password']) assert.match(reg,new RegExp(`<label[^>]*for="${f}"`));
  assert.match(reg,/'Ocultar' : 'Mostrar'/); assert.match(reg,/id="password-help"/);
  assert.match(reg,/>Crear cuenta<\/button>/); assert.doesNotMatch(reg,/ENVIAR|REGISTRATE/);
  assert.match(src('register/register.component.ts'),/markAllAsTouched\(\)/,'validación al enviar sin alerta genérica');
});
test('10 recuperación: "Enviar enlace", próximo paso y reintento',()=>{
  assert.match(rec,/<label[^>]*for="email"/); assert.match(rec,/>Enviar enlace</); assert.match(rec,/Revisá tu correo/); assert.match(rec,/Enviar de nuevo/);
  assert.match(rec,/error: \(err\)/,'el error ya no se ignora');
});
test('11/20 contraseña: labels, Mostrar/Ocultar en cada campo, "Guardar contraseña" y estados de enlace',()=>{
  for(const f of ['oldPassword','password1','password2']) assert.match(rst,new RegExp(`<label[^>]*for="${f}"`));
  assert.equal((rst.match(/'Ocultar' : 'Mostrar'/g)||[]).length,3);
  assert.match(rst,/>Guardar contraseña</); assert.match(rst,/Nueva contraseña/);
  for(const s of ["'invalid'","'error'","'done'"]) assert.ok(rst.includes(`linkState === ${s}`),s);
  assert.match(rst,/Volver al panel/);
});
test('12 verificar correo: título pedido, mismo contenedor y reenvío sin diálogo',()=>{
  assert.match(ver,/No pudimos verificar tu correo/); assert.match(ver,/login\.component\.scss/);
  assert.doesNotMatch(ver,/inputAlert|setTimeout/); assert.match(ver,/Reenviar enlace/);
});
