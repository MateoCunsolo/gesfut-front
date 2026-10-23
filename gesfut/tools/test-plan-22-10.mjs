// Regresiones del plan 22/10 (respuestas de Mateo). Ejecutar: node tools/test-plan-22-10.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const src=p=>readFileSync(new URL('../src/app/'+p,import.meta.url),'utf8');
const load=async p=>import('data:text/javascript,'+encodeURIComponent(ts.transpileModule(src(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText));
const row=(EQUIPO,NOMBRE,APELLIDO,DORSAL,CAPITAN='',ARQUERO='')=>({EQUIPO,NOMBRE,APELLIDO,DORSAL,CAPITAN,ARQUERO,COLOR_CAMISETA:'#fff'});
test('#12 orden natural: Fecha 2 antes que Fecha 10, sin distinguir mayusculas',async()=>{
  const {naturalCompare:c}=await load('core/utils/natural-sort.ts');
  assert.deepEqual(['Fecha 10','fecha 2','Fecha 1','Equipo B'].sort(c),['Equipo B','Fecha 1','fecha 2','Fecha 10']);
  assert.match(src('admin/list-teams/names-teams.component.ts'),/naturalCompare\(a\.name, b\.name\)/);
  assert.doesNotMatch(src('admin/initialize-tournament/initialize-tournament.component.ts'),/localeCompare/);
});
test('#15 Excel parcial: importa los equipos validos y reporta las filas/equipos con error',async()=>{
  const {parseTeamRows:p}=await load('core/utils/excel-teams.ts');
  const r=p([row('TEST Bueno','Juan','Perez',1,'SI','SI'),row('TEST Bueno','Pedro','Gomez',2),row('TEST Malo','Ana','Diaz',3),row('TEST Malo','Leo','Sosa',4),row('TEST Bueno','Jo','X','z')]);
  assert.deepEqual(r.teams.map(t=>t.name),['TEST Bueno']);
  assert.match(r.errors.join('|'),/Fila 6: falta/);
  assert.match(r.errors.join('|'),/TEST Malo: necesita exactamente 1 capit/);
  const u=src('admin/excel-upload/excel-upload.component.ts'); assert.match(u,/if \(!parsed\.teams\.length\)/); assert.match(u,/this\.dataLoaded\.emit\(parsed\)/);
  const c=src('admin/create-team/create-team.component.ts'); assert.match(c,/report\?\.failed/); assert.match(c,/no se import\u00f3 lo siguiente/);
});
