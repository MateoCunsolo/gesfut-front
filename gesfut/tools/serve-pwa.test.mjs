import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createPwaServer } from './serve-pwa.mjs';

async function listen(server) { server.listen(0, '127.0.0.1'); await once(server, 'listening'); return `http://127.0.0.1:${server.address().port}`; }
async function close(server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }

test('manifest, iconos, service worker y rutas de navegación', async () => {
  const server=createPwaServer(); const base=await listen(server);
  try {
    const deep=await fetch(base+'/admin'); assert.equal(deep.status,200); assert.match(await deep.text(),/manifest.webmanifest/);
    const manifestResponse=await fetch(base+'/manifest.webmanifest'); assert.match(manifestResponse.headers.get('content-type'),/application\/manifest\+json/);
    const manifest=await manifestResponse.json(); assert.equal(manifest.display,'standalone'); assert.equal(manifest.scope,'/');
    for(const icon of manifest.icons){const response=await fetch(base+'/'+icon.src);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');}
    const sw=await fetch(base+'/ngsw-worker.js');assert.equal(sw.status,200);assert.equal(sw.headers.get('cache-control'),'no-cache');
    const config=await (await fetch(base+'/ngsw.json')).json();assert.deepEqual(config.dataGroups,[]);assert.ok(config.assetGroups[0].urls.some(url=>url.endsWith('.js')));
    assert.equal((await fetch(base+'/missing-chunk.js')).status,404);
    assert.equal((await fetch(base+'/admin',{method:'POST'})).status,405);
    const head=await fetch(base+'/manifest.webmanifest',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  } finally {await close(server);}
});

test('proxy conserva método, autorización y cuerpo; los datos no se cachean', async () => {
  let received;
  const api=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;received={url:req.url,method:req.method,authorization:req.headers.authorization,body};res.writeHead(201,{'content-type':'application/json'});res.end('{"saved":true}');});
  const apiBase=await listen(api);const server=createPwaServer({apiTarget:apiBase});const base=await listen(server);
  try {
    const response=await fetch(base+'/api/v1/matches/load-result?test=1',{method:'POST',headers:{authorization:'Bearer test-only','content-type':'application/json'},body:'{"matchId":1}'});
    assert.equal(response.status,201);assert.equal(response.headers.get('cache-control'),'no-store');assert.deepEqual(await response.json(),{saved:true});
    assert.deepEqual(received,{url:'/api/v1/matches/load-result?test=1',method:'POST',authorization:'Bearer test-only',body:'{"matchId":1}'});
  } finally {await close(server);await close(api);}
});

test('API apagada informa error; nunca devuelve un guardado exitoso', async () => {
  const api=http.createServer();const target=await listen(api);await close(api);
  const server=createPwaServer({apiTarget:target});const base=await listen(server);
  try {const response=await fetch(base+'/api/v1/matches/load-result',{method:'POST',body:'{}'});assert.equal(response.status,502);assert.match((await response.json()).error,/no se guardaron/);}
  finally {await close(server);}
});

test('rechaza acceso fuera de la carpeta pública', async () => {
  const server=createPwaServer();const base=await listen(server);
  try {
    const status=await new Promise((resolve,reject)=>{const req=http.get(base+'/%2e%2e%2fpackage.json',res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);});
    assert.equal(status,400);
  } finally {await close(server);}
});
