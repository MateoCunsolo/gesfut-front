import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import {InitializeTournamentComponent} from '../src/app/admin/initialize-tournament/initialize-tournament.component';
function fixture(){
 let stored:any;
 const component=new InitializeTournamentComponent({} as any,{} as any,{} as any,{} as any,{setTeamsToInitTournament(){},setDateToInitTournament(value:any){stored=value;}} as any,{confirmAlert:()=>Promise.resolve({isConfirmed:false})} as any);
 const teams=[{id:1,name:'Norte'},{id:2,name:'Sur'},{id:3,name:'Centro'}] as any;
 component.teams=[...teams];component.teamsFilters=[...teams];return {component,teams,date:()=>stored};
}
test('agregar resultados respeta búsqueda y quitar no duplica equipos',()=>{
 const {component:c,teams}=fixture();c.searchTerm='Norte';c.filterTeams();c.addAllTeams();
 assert.deepEqual(c.teamsTournament.map(t=>t.id),[1]);c.resetFilters();c.deleteAllTeams();assert.equal(c.teamsTournament.length,1,'cancelar no quita');(c as any).doDeleteAllTeams();
 assert.equal(c.teams.length,3);assert.equal(new Set(c.teams.map(t=>t.id)).size,3);
 c.addTeam(teams[0]);c.addTeam({...teams[0]});assert.equal(c.teamsTournament.length,1);
 c.searchTerm='Sur';c.filterTeams();c.deleteTeam(teams[0]);assert.deepEqual(c.teams.map(t=>t.name),['Sur']);
});
test('quitar programación limpia también el estado compartido',()=>{
 const x=fixture();x.component.date='2026-11-01T12:00';x.component.minutes=60;x.component.days=7;
 x.component.cancelDate();assert.deepEqual(x.date(),{date:'',days:0,minutes:0});assert.equal(x.component.date,'');
});

import {applySetupTeamSelection, clearSetupTeamSelection, missingSelectionMessage, readSetupTeamSelection, setupRequirementText, setupTeamSelectionKey, writeSetupTeamSelection} from '../src/app/core/utils/setup-team-selection';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
function mem(): {store: Record<string,string>; api: {getItem(k:string):string|null; setItem(k:string,v:string):void; removeItem(k:string):void}} {
  const store: Record<string,string> = {};
  return {store, api: {getItem: k => store[k] ?? null, setItem: (k,v) => { store[k] = v; }, removeItem: k => { delete store[k]; }}};
}
test('seleccion de equipos: clave por usuario y torneo, restore valida disponibles y limpia', () => {
  assert.equal(setupTeamSelectionKey('Ana@X.com', 'tor-1'), 'gesfut:setupTeams:ana@x.com:tor-1');
  assert.equal(setupTeamSelectionKey('Ana@X.com', 'tor-2'), 'gesfut:setupTeams:ana@x.com:tor-2');
  assert.notEqual(setupTeamSelectionKey('ana@x.com', 'tor-1'), setupTeamSelectionKey('beto@x.com', 'tor-1'));
  assert.equal(setupTeamSelectionKey('', 'tor-1'), null);
  const local = mem(); const session = mem();
  writeSetupTeamSelection(local.api, 'ana@x.com', 'tor-1', [{id:1,name:'QA Diez'},{id:2,name:'QA Once'},{id:3,name:'QA Doce'}]);
  writeSetupTeamSelection(local.api, 'ana@x.com', 'tor-2', [{id:9,name:'Otro'}]);
  const available = [{id:1,name:'QA Diez'},{id:2,name:'QA Once'}];
  const saved = readSetupTeamSelection(local.api, 'ana@x.com', 'tor-1', session.api);
  const {selected, missing} = applySetupTeamSelection(saved, available);
  assert.deepEqual(selected.map(t => t.id), [1, 2]);
  assert.deepEqual(missing, [{id:3,name:'QA Doce'}]);
  assert.match(missingSelectionMessage(missing), /QA Doce/);
  assert.deepEqual(readSetupTeamSelection(local.api, 'ana@x.com', 'tor-2', session.api).map(t => t.id), [9]);
  assert.deepEqual(readSetupTeamSelection(local.api, 'beto@x.com', 'tor-1', session.api), []);
  clearSetupTeamSelection(local.api, 'ana@x.com', 'tor-1', session.api);
  assert.deepEqual(readSetupTeamSelection(local.api, 'ana@x.com', 'tor-1', session.api), []);
  assert.deepEqual(readSetupTeamSelection(local.api, 'ana@x.com', 'tor-2', session.api).map(t => t.id), [9]);
});
test('seleccion de equipos: migra el sessionStorage viejo y respeta el orden de carga', () => {
  const local = mem(); const session = mem();
  session.api.setItem('initTeams:tor-1', JSON.stringify([3,1]));
  const migrated = readSetupTeamSelection(local.api, 'ana@x.com', 'tor-1', session.api);
  assert.deepEqual(migrated.map(t => t.id), [3, 1]);
  assert.equal(session.store['initTeams:tor-1'], undefined);
  assert.ok(local.store['gesfut:setupTeams:ana@x.com:tor-1']);
  const {selected} = applySetupTeamSelection(migrated, [{id:1,name:'A'},{id:3,name:'C'},{id:2,name:'B'}]);
  assert.deepEqual(selected.map(t => t.id), [3, 1]);
});
test('texto del minimo de equipos', () => {
  assert.equal(setupRequirementText(0), 'Necesit\u00e1s al menos 2 equipos para empezar.');
  assert.equal(setupRequirementText(1), 'Necesit\u00e1s al menos 2 equipos. Te falta 1.');
});
test('initialize-tournament persiste en localStorage por usuario+torneo y limpia al inicializar', () => {
  const root = fileURLToPath(new URL('../src/app/admin/initialize-tournament/', import.meta.url)).replace(/^\/([A-Za-z]:)/, '$1');
  const ts = readFileSync(root + 'initialize-tournament.component.ts', 'utf8');
  const html = readFileSync(root + 'initialize-tournament.component.html', 'utf8');
  assert.match(ts, /writeSetupTeamSelection/);
  assert.match(ts, /clearSetupTeamSelection/);
  assert.match(ts, /tryRestoreSelection/);
  assert.match(ts, /localStorage/);
  assert.equal(ts.includes("sessionStorage.setItem(this.selectionKey()"), false);
  assert.match(html, /requirementText\(\)/);
});
