import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import {InitializeTournamentComponent} from '../src/app/admin/initialize-tournament/initialize-tournament.component';
function fixture(){
 let stored:any;
 const component=new InitializeTournamentComponent({} as any,{} as any,{} as any,{} as any,{setTeamsToInitTournament(){},setDateToInitTournament(value:any){stored=value;}} as any,{} as any);
 const teams=[{id:1,name:'Norte'},{id:2,name:'Sur'},{id:3,name:'Centro'}] as any;
 component.teams=[...teams];component.teamsFilters=[...teams];return {component,teams,date:()=>stored};
}
test('agregar resultados respeta búsqueda y quitar no duplica equipos',()=>{
 const {component:c,teams}=fixture();c.searchTerm='Norte';c.filterTeams();c.addAllTeams();
 assert.deepEqual(c.teamsTournament.map(t=>t.id),[1]);c.resetFilters();c.deleteAllTeams();
 assert.equal(c.teams.length,3);assert.equal(new Set(c.teams.map(t=>t.id)).size,3);
 c.addTeam(teams[0]);c.addTeam({...teams[0]});assert.equal(c.teamsTournament.length,1);
 c.searchTerm='Sur';c.filterTeams();c.deleteTeam(teams[0]);assert.deepEqual(c.teams.map(t=>t.name),['Sur']);
});
test('quitar programación limpia también el estado compartido',()=>{
 const x=fixture();x.component.date='2026-11-01T12:00';x.component.minutes=60;x.component.days=7;
 x.component.cancelDate();assert.deepEqual(x.date(),{date:'',days:0,minutes:0});assert.equal(x.component.date,'');
});
