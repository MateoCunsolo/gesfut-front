import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import {HttpErrorResponse} from '@angular/common/http';
import {lastPlayedFailed, recapEmptyState} from '../src/app/core/utils/recap-state';
const enCurso={code:'ABC',isFinished:false,championOfLeagueId:null,championOfPlayoffsId:null};
const finalizado={code:'ABC',isFinished:true,championOfLeagueId:7,championOfPlayoffsId:null};
test('404 de lastPlayed con torneo cargado y sin fechas => preparando',()=>{
 const failed=lastPlayedFailed(new HttpErrorResponse({status:404}));assert.equal(failed,false);
 assert.equal(recapEmptyState(true,failed,enCurso,'abc'),'preparing');
});
test('500 de lastPlayed => error',()=>{
 const failed=lastPlayedFailed(new HttpErrorResponse({status:500}));assert.equal(failed,true);
 assert.equal(recapEmptyState(true,failed,enCurso,'ABC'),'error');
});
test('error de red (status 0) o timeout => error',()=>{
 assert.equal(recapEmptyState(true,lastPlayedFailed(new HttpErrorResponse({status:0})),enCurso,'ABC'),'error');
 assert.equal(recapEmptyState(true,lastPlayedFailed(new Error('timeout')),enCurso,'ABC'),'error');
});
test('codigo inexistente (torneo no cargado) => nunca preparando',()=>{
 const failed=lastPlayedFailed(new HttpErrorResponse({status:404}));
 assert.notEqual(recapEmptyState(true,failed,null,'0000'),'preparing');
 assert.notEqual(recapEmptyState(true,failed,{code:'OTRO'},'0000'),'preparing');
});
test('finalizado con 404 de lastPlayed => finalizado, no preparando',()=>{
 assert.equal(recapEmptyState(true,lastPlayedFailed(new HttpErrorResponse({status:404})),finalizado,'abc'),'finished');
});

import {aggregateMatchDayScorers} from '../src/app/core/utils/match-day-scorers';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const ev = (id: number, name: string, team: string, quantity: number, type = 'GOAL') => ({type, idPlayerParticipant: id, playerName: name, teamName: team, quantity});
test('goleadores de la fecha: agrupa por id, no por nombre, y muestra el equipo si hay homonimos', () => {
  const list = aggregateMatchDayScorers([
    {events: [ev(101, 'Test1 QA', 'QA Once', 2), ev(202, 'Test1 QA', 'QA Trece', 1)]},
    {events: [ev(101, 'Test1 QA', 'QA Once', 0), ev(303, 'Otro', 'QA Diez', 1), {type: 'YELLOW_CARD', idPlayerParticipant: 101, playerName: 'Test1 QA', teamName: 'QA Once', quantity: 1}]},
  ]);
  assert.equal(list.length, 3);
  assert.equal(list[0].playerId, 101);
  assert.equal(list[0].goals, 2);
  assert.equal(list[0].showTeam, true);
  assert.equal(list[0].teamName, 'QA Once');
  const once = list.find(s => s.playerId === 101);
  const trece = list.find(s => s.playerId === 202);
  const otro = list.find(s => s.playerId === 303);
  assert.equal(once?.goals, 2);
  assert.equal(once?.showTeam, true);
  assert.equal(once?.teamName, 'QA Once');
  assert.equal(trece?.goals, 1);
  assert.equal(trece?.showTeam, true);
  assert.equal(trece?.teamName, 'QA Trece');
  assert.equal(otro?.playerName, 'Otro');
  assert.equal(otro?.showTeam, false);
  assert.equal(otro?.goals, 1);
  const unique = aggregateMatchDayScorers([{events: [ev(1, 'Ana', 'A', 3), ev(2, 'Beto', 'B', 1)]}]);
  assert.equal(unique.every(s => s.showTeam === false), true);
  const samePlayerTwice = aggregateMatchDayScorers([
    {events: [ev(7, 'Ana', 'A', 1)]},
    {events: [ev(7, 'Ana', 'A', 2)]},
  ]);
  assert.deepEqual(samePlayerTwice.map(s => [s.playerId, s.goals, s.showTeam]), [[7, 3, false]]);
});
test('recap usa el agrupado por id y muestra el equipo al lado cuando hay homonimos', () => {
  const root = fileURLToPath(new URL('../src/app/guest/recap/', import.meta.url)).replace(/^\/([A-Za-z]:)/, '$1');
  const ts = readFileSync(root + 'recap.component.ts', 'utf8');
  const html = readFileSync(root + 'recap.component.html', 'utf8');
  assert.match(ts, /aggregateMatchDayScorers\(this\.lastMatchDay\?\.matches\)/);
  assert.match(html, /track scorer\.playerId/);
  assert.match(html, /@if\(scorer\.showTeam\)\{ \(\{\{scorer\.teamName\}\}\)\}/);
});
