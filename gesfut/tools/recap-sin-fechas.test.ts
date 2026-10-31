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
