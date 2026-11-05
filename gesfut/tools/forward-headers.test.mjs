import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { PassThrough } from 'node:stream';
import { createPwaServer, sanitizeForwardHeaders } from './serve-pwa.mjs';

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

// Tema 6b (5/11)
const extra = () => ({ accept: 'text/plain', 'x-real-ip': '1.1.1.1', forwarded: 'for=1.1.1.1', 'true-client-ip': '2.2.2.2', 'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'http', 'X-Real-IP': '3.3.3.3', 'Forwarded': 'for=3.3.3.3', 'True-Client-IP': '4.4.4.4', 'X-Forwarded-Host': 'x', 'X-Forwarded-Proto': 'https', 'cf-connecting-ip': '5.5.5.5', 'x-forwarded-for': '6.6.6.6' });

test('6b no loopback: borra x-real-ip, forwarded, true-client-ip, x-forwarded-host y x-forwarded-proto (cualquier caso)', () => {
  const h = extra(); const copia = { ...h };
  assert.deepEqual(sanitizeForwardHeaders(h, '203.0.113.9'), { accept: 'text/plain', 'cf-connecting-ip': '203.0.113.9' });
  assert.deepEqual(h, copia, 'no muta la entrada');
});

test('6b loopback: deja todas esas cabeceras tal cual', () => {
  for (const lo of ['127.0.0.1', '::1', '::ffff:127.0.0.1']) assert.deepEqual(sanitizeForwardHeaders(extra(), lo), extra(), lo);
});

/** Destino HTTP local (puerto aleatorio) que guarda los headers que le llegan. */
async function destino() {
  const recibidos = [];
  const srv = http.createServer((req, res) => { recibidos.push(req.headers); res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}'); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  return { srv, recibidos, url: `http://127.0.0.1:${srv.address().port}` };
}

test('createPwaServer: cliente real en loopback, las cabeceras pasan tal cual al back', async () => {
  const d = await destino();
  const proxy = createPwaServer({ apiTarget: d.url });
  await new Promise(r => proxy.listen(0, '127.0.0.1', r));
  try {
    await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: proxy.address().port, path: '/api/v1/ping', method: 'GET', headers: { 'cf-connecting-ip': '198.51.100.7', 'x-real-ip': '198.51.100.8' } }, res => { res.resume(); res.on('end', resolve); });
      req.on('error', reject); req.end();
    });
    assert.equal(d.recibidos.length, 1);
    assert.equal(d.recibidos[0]['cf-connecting-ip'], '198.51.100.7');
    assert.equal(d.recibidos[0]['x-real-ip'], '198.51.100.8');
  } finally { proxy.close(); d.srv.close(); }
});

test('createPwaServer: pedido desde un socket no loopback (simulado) llega al back sin las cabeceras del cliente y con la IP del socket', async () => {
  const d = await destino();
  const proxy = createPwaServer({ apiTarget: d.url });
  try {
    // Request simulado con socket.remoteAddress externo: se entrega al handler real del server (sin abrir puertos fuera de loopback).
    const req = new PassThrough();
    Object.assign(req, { url: '/api/v1/ping', method: 'GET', headers: extra(), socket: { remoteAddress: '::ffff:203.0.113.9' } });
    const res = new PassThrough();
    const fin = new Promise(r => res.on('finish', r));
    Object.assign(res, { headersSent: false, writeHead(code, headers) { this.statusCode = code; this.headersSent = true; return this; } });
    proxy.emit('request', req, res);
    req.end();
    res.resume();
    await fin;
    assert.equal(res.statusCode, 200);
    const h = d.recibidos[0];
    assert.equal(h['cf-connecting-ip'], '203.0.113.9');
    for (const k of ['x-forwarded-for', 'x-real-ip', 'forwarded', 'true-client-ip', 'x-forwarded-host', 'x-forwarded-proto']) assert.equal(h[k], undefined, k);
  } finally { d.srv.close(); }
});
