import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/gesfut/browser');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };

export function createPwaServer({ root = defaultRoot, apiTarget = 'http://127.0.0.1:8080' } = {}) {
  return http.createServer(async (request, response) => {
    let url;
    try { url = new URL(request.url, 'http://localhost'); } catch { response.writeHead(400).end(); return; }
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const target = new URL(apiTarget);
      const upstream = http.request({ hostname: target.hostname, port: target.port || 80, path: url.pathname + url.search, method: request.method,
        headers: { ...request.headers, host: target.host } }, incoming => {
        response.writeHead(incoming.statusCode ?? 502, { ...incoming.headers, 'cache-control': 'no-store' });
        incoming.pipe(response);
      });
      upstream.setTimeout(30000, () => upstream.destroy(new Error('API timeout')));
      upstream.on('error', () => {
        if (!response.headersSent) response.writeHead(502, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        response.end(JSON.stringify({ error: 'No se pudo conectar con el servidor. Tus cambios no se guardaron. Intentá nuevamente.' }));
      });
      request.on('aborted', () => upstream.destroy());
      request.pipe(upstream);
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { allow: 'GET, HEAD' }).end(); return; }
    let decoded;
    try { decoded = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end(); return; }
    if (decoded.includes('\0') || decoded.includes('\\') || decoded.split('/').includes('..')) { response.writeHead(400).end(); return; }
    let file = path.resolve(root, '.' + decoded);
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403).end(); return; }
    let info = await stat(file).catch(() => null);
    if (!info?.isFile()) {
      // Solo rutas de navegación reciben index.html. Los assets ausentes son 404.
      // Loop 5: los links de mail llevan un JWT con puntos (/auth/verify-email/aaa.bbb.ccc): una navegacion (Accept text/html) siempre recibe la app.
      const isNavigation = (request.headers.accept ?? '').includes('text/html');
      if (path.extname(decoded) && !isNavigation) { response.writeHead(404).end(); return; }
      file = path.join(root, 'index.html');
      info = await stat(file).catch(() => null);
      if (!info?.isFile()) { response.writeHead(503).end('Primero ejecutá npm run build.'); return; }
    }
    response.writeHead(200, { 'content-type': mime[path.extname(file)] ?? 'application/octet-stream', 'content-length': info.size,
      'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(file);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.GESFUT_PORT || 4200);
  const host = process.env.GESFUT_HOST || '127.0.0.1';
  createPwaServer({ apiTarget: process.env.GESFUT_API_TARGET || 'http://127.0.0.1:8080' }).listen(port, host, () => {
    console.log(`Gesfut PWA: http://${host}:${port}`);
  });
}
