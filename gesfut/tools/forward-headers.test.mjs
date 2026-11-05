import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForwardHeaders } from './serve-pwa.mjs';

const cliente = () => ({ accept: 'application/json', 'cf-connecting-ip': '6.6.6.6', 'x-forwarded-for': '7.7.7.7, 8.8.8.8', 'CF-Connecting-IP': '9.9.9.9', 'X-Forwarded-For': '1.1.1.1' });

test('no loopback: borra las cabeceras del cliente y pone la IP del socket', () => {
  const out = sanitizeForwardHeaders(cliente(), '203.0.113.5');
  assert.deepEqual(out, { accept: 'application/json', 'cf-connecting-ip': '203.0.113.5' });
  assert.equal(sanitizeForwardHeaders(cliente(), '2001:db8::7')['cf-connecting-ip'], '2001:db8::7');
});

test('::ffff:IPv4 externa queda como la IPv4', () => {
  const out = sanitizeForwardHeaders(cliente(), '::ffff:198.51.100.4');
  assert.equal(out['cf-connecting-ip'], '198.51.100.4');
  assert.equal(out['x-forwarded-for'], undefined);
  assert.equal(sanitizeForwardHeaders(cliente(), '::FFFF:198.51.100.4')['cf-connecting-ip'], '198.51.100.4');
});

test('loopback (cloudflared): 127.0.0.1, ::1 y ::ffff:127.0.0.1 dejan los headers tal cual', () => {
  for (const lo of ['127.0.0.1', '::1', '::ffff:127.0.0.1', '::FFFF:127.0.0.1']) assert.deepEqual(sanitizeForwardHeaders(cliente(), lo), cliente(), lo);
});

test('no muta la entrada', () => {
  const h = cliente(); const copia = { ...h };
  const out = sanitizeForwardHeaders(h, '203.0.113.5');
  assert.deepEqual(h, copia);
  assert.notEqual(out, h);
  assert.notEqual(sanitizeForwardHeaders(h, '127.0.0.1'), h);
});

test('remoteAddress undefined: borra y no inventa IP', () => {
  const out = sanitizeForwardHeaders(cliente(), undefined);
  assert.deepEqual(out, { accept: 'application/json' });
  assert.deepEqual(sanitizeForwardHeaders(cliente(), ''), { accept: 'application/json' });
});
