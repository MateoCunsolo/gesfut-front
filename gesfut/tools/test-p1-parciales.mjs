// Regresiones de las vistas P1 parciales (08, 17/33, 18/32, 24, 28) y de match-card compacto.
// Pruebas estáticas sobre plantillas: rápidas y sin navegador. Ejecutar: node tools/test-p1-parciales.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../src/app/'+p,import.meta.url),'utf8');
const count=(s,re)=>(s.match(re)||[]).length;

test('match-card proyecta las acciones una sola vez (compacto y normal)',()=>{
  const s=src('shared/match-card/match-card.component.ts');
  assert.equal(count(s,/<ng-content\b/g),1,'dos <ng-content> en ramas @if pierden las acciones en modo compacto');
});
test('08 login: labels persistentes, Mostrar/Ocultar y recuperación siempre visible',()=>{
  const h=src('auth/login/login.component.html');
  assert.match(h,/<label[^>]*for="email"/); assert.match(h,/<label[^>]*for="password"/);
  assert.match(h,/showPassword \? 'text' : 'password'/); assert.match(h,/'Ocultar' : 'Mostrar'/);
  assert.match(h,/Olvidé mi contraseña/); assert.doesNotMatch(h,/@if[^\n]*\n[^\n]*Olvidé mi contraseña/);
});
test('17/33 crear equipo: labels, roles en texto y regreso a la preparación explicado',()=>{
  const h=src('admin/create-team/create-team.component.html');
  for(const f of ['teamName','teamColor']) assert.match(h,new RegExp(`<label[^>]*for="${f}"`));
  for(const f of ['playerName-','playerLastName-','playerNumber-']) assert.match(h,new RegExp(`\\[for\\]="'${f}' \\+ i"`));
  assert.match(h,/<span>Capitán<\/span>/); assert.match(h,/<span>Arquero<\/span>/);
  assert.match(h,/Jugador \{\{ i \+ 1 \}\}/);
  assert.match(h,/volvés a la preparación/); assert.match(h,/Volver a la preparación/);
});
test('18/32 agregar jugador: el foco vuelve al disparador al cancelar y hay contexto',()=>{
  for(const base of ['admin/list-teams/components/players/players.component','admin/list-team-tournaments/players-tournament/players-tournament.component']){
    const h=src(base+'.html'), t=src(base+'.ts');
    assert.match(h,/#addPlayerTrigger/); assert.match(t,/focusAddTriggerPending = true/); assert.match(t,/\.focus\(/);
    assert.match(h,/\[destinationName\]="[^"]*' · '/,'destino con equipo · torneo');
  }
  const a=src('admin/list-teams/components/players/add-player/add-player.component.html');
  for(const f of ['addPlayerName','addPlayerLastName','addPlayerNumber']) assert.match(a,new RegExp(`<label[^>]*for="${f}"`));
});
test('28 editor: en edición el registro va primero y hay resumen antes de guardar',()=>{
  const h=src('admin/match-day/load-result/load-result.component.html');
  assert.match(h,/\[class\.editing\]="isEditMatch"/); assert.match(h,/summary-line/);
  assert.match(src('admin/match-day/load-result/load-result.component.scss'),/\.editor-layout\.editing \.events-panel\{order:-1;\}/);
});
