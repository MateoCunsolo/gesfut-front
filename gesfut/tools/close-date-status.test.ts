import test from 'node:test';
import assert from 'node:assert/strict';
import {closeDateStatus, pendingCloseMatches} from '../src/app/core/utils/close-date-status';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

test('cerrar fecha: textos de estado y primer partido pendiente', () => {
  const a = {id:1,isFinished:true,isBye:false,homeTeam:'A',awayTeam:'B',dateTime:'2026-11-10T12:00:00'};
  const b = {id:2,isFinished:false,isBye:false,homeTeam:'QA Diez',awayTeam:'QA Doce',dateTime:'2026-11-11T18:00:00',canLoadResult:false};
  const c = {id:3,isFinished:false,isBye:true,homeTeam:'Libre',awayTeam:'Free'};
  const d = {id:4,isFinished:false,isBye:false,homeTeam:'QA Once',awayTeam:'QA Trece'};
  assert.deepEqual(pendingCloseMatches([a,b,c,d]).map(m=>m.id), [2,4]);
  const closed = closeDateStatus({isFinished:true,numberOfMatchDay:0,matches:[a]});
  assert.match(closed.text, /fecha 1 est/);
  assert.equal(closed.canClose, false);
  const ready = closeDateStatus({isFinished:false,numberOfMatchDay:0,matches:[a,c]});
  assert.equal(ready.canClose, true);
  assert.match(ready.text, /Todos los partidos tienen resultado/);
  const many = closeDateStatus({isFinished:false,numberOfMatchDay:0,matches:[b,d]});
  assert.equal(many.canClose, false);
  assert.equal(many.firstPending?.id, 2);
  assert.match(many.text, /2 partidos/);
  const future = closeDateStatus({isFinished:false,numberOfMatchDay:0,matches:[b]});
  assert.match(future.text, /Falta jugar: QA Diez vs QA Doce/);
  const noTime = closeDateStatus({isFinished:false,numberOfMatchDay:0,matches:[d]});
  assert.match(noTime.text, /todav/);
  const one = closeDateStatus({isFinished:false,numberOfMatchDay:0,matches:[{...d,dateTime:'2026-11-10T12:00:00',canLoadResult:true}]});
  assert.match(one.text, /Falta cargar el resultado de QA Once vs QA Trece/);
});

test('list-match-days muestra el motivo sin tocar y lleva al primer pendiente', () => {
  const root = fileURLToPath(new URL('../src/app/admin/match-day/list-match-days/', import.meta.url)).replace(/^\/([A-Za-z]:)/, '$1');
  const ts = readFileSync(root + 'list-match-days.component.ts', 'utf8');
  const html = readFileSync(root + 'list-match-days.component.html', 'utf8');
  assert.match(ts, /closeDateStatus/);
  assert.match(ts, /explainCloseDate/);
  assert.match(html, /closeDateStatusText\(\)/);
  assert.match(html, /fixture-match-/);
});
