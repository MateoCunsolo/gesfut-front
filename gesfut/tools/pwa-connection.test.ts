import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { HttpErrorResponse, HttpRequest, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { PwaService } from '../src/app/core/services/pwa.service';
import { pwaConnectionInterceptor } from '../src/app/core/interceptors/pwa-connection.interceptor';

function fixture() {
  const pwa={online:signal(true),serverUnavailable:signal(false)};
  const injector=createEnvironmentInjector([{provide:PwaService,useValue:pwa}],null as any);
  const send=(request:HttpRequest<unknown>,next:HttpHandlerFn)=>runInInjectionContext(injector,()=>pwaConnectionInterceptor(request,next));
  return { injector, pwa, send };
}

test('sin conexión un resultado no se envía ni se encola', async()=>{
  const {injector,pwa,send}=fixture();pwa.online.set(false);let sent=false;
  try {
    const result=send(new HttpRequest('POST','/api/v1/matches/load-result',{matchId:1,events:[]}),()=>{sent=true;return of(new HttpResponse({status:201}));});
    await assert.rejects(firstValueFrom(result),(error:HttpErrorResponse)=>error.status===0 && error.error.error.includes('no se guardaron'));
    assert.equal(sent,false);
  } finally {injector.destroy();}
});

test('sin conexión no se presenta información vieja como datos actuales', async()=>{
  const {injector,pwa,send}=fixture();pwa.online.set(false);let sent=false;
  try {
    const result=send(new HttpRequest('GET','/api/v1/tournaments/example'),()=>{sent=true;return of(new HttpResponse({body:{name:'Torneo'}}));});
    await assert.rejects(firstValueFrom(result),(error:HttpErrorResponse)=>error.status===0 && error.error.error.includes('datos actuales'));
    assert.equal(sent,false);
  } finally {injector.destroy();}
});

test('un 504 del service worker muestra el problema y una respuesta válida lo limpia', async()=>{
  const {injector,pwa,send}=fixture();
  try {
    const request=new HttpRequest('GET','/api/v1/tournaments/example');
    const failed=send(request,()=>throwError(()=>new HttpErrorResponse({status:504,statusText:'Gateway Timeout'})));
    await assert.rejects(firstValueFrom(failed));assert.equal(pwa.serverUnavailable(),true);
    const recovered=send(request,()=>of(new HttpResponse({body:{name:'Torneo'}})));
    assert.deepEqual((await firstValueFrom(recovered) as HttpResponse<unknown>).body,{name:'Torneo'});
    assert.equal(pwa.serverUnavailable(),false);
  } finally {injector.destroy();}
});
