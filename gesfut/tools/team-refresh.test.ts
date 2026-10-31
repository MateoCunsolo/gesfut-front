import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createEnvironmentInjector,runInInjectionContext} from '@angular/core';
import {BehaviorSubject,of} from 'rxjs';
import {ListTeamsTournamentsComponent} from '../src/app/admin/list-team-tournaments/list-teams-tournaments.component';
import {TournamentService} from '../src/app/core/services/tournament/tournament.service';
import {TeamService} from '../src/app/core/services/tournament/team.service';
import {DashboardService} from '../src/app/core/services/dashboard.service';
import {SessionService} from '../src/app/core/services/manager/session.service';
import {indexInShownList} from '../src/app/core/utils/team-selection';
import {INITIAL_TOURNAMENT,emptyParticipant} from '../src/app/core/services/tournament/initial-tournament';
function fixture(){
 const a={...emptyParticipant(),idParticipant:11,idTeam:1,name:'Alpha',color:'green'};
 const b={...emptyParticipant(),idParticipant:22,idTeam:2,name:'Beta',color:'blue'};
 const current=new BehaviorSubject({...INITIAL_TOURNAMENT,participants:[a,b]});
 const clicked=new BehaviorSubject(0);
 const injector=createEnvironmentInjector([
 {provide:TournamentService,useValue:{currentTournament:current,getLastTeamClicked:()=>clicked,setLastTeamClicked:(n:number)=>clicked.next(n)}},
 {provide:TeamService,useValue:{getTeamColor:()=>of('green')}},
 {provide:DashboardService,useValue:{}},{provide:SessionService,useValue:{isAuth:()=>true}}
 ],null as any);
 const c=runInInjectionContext(injector,()=>new ListTeamsTournamentsComponent()) as any;c.ngOnInit();
 return {c,a,b,current,clicked,injector,refresh:(participants:any[])=>current.next({...INITIAL_TOURNAMENT,participants})};
}
test('si desaparece el seleccionado no se cambia al equipo que ocupa su posición',()=>{
 const x=fixture();try{x.c.showParticipants(22);x.refresh([x.a]);assert.equal(x.c.teamParticipant.idParticipant,0);assert.equal(x.c.bindingSelect,0);assert.equal(x.c.nameClicked,'');assert.equal(x.c.colorSelected,'');}finally{x.injector.destroy();}
});
test('refrescar conserva el id aunque cambie el orden y mantiene la búsqueda',()=>{
 const x=fixture();try{x.c.showParticipants(22);x.c.searchTeams({target:{value:'Beta'}});x.refresh([x.b,x.a]);assert.equal(x.c.teamParticipant.idParticipant,22);assert.deepEqual(x.c.particpantsFilter.map((p:any)=>p.idParticipant),[22]);}finally{x.injector.destroy();}
});
test('vaciar la lista limpia el detalle y volver a llenarla exige elegir tras una baja',()=>{
 const x=fixture();try{x.refresh([]);assert.equal(x.c.teamParticipant.idParticipant,0);x.refresh([x.b]);assert.equal(x.c.teamParticipant.idParticipant,0);x.c.showParticipants(22);assert.equal(x.c.teamParticipant.name,'Beta');}finally{x.injector.destroy();}
});

test('un índice recordado no selecciona otro equipo después de desaparecer el anterior',()=>{
 const x=fixture();try{x.c.showParticipants(22);x.refresh([x.a]);x.clicked.next(0);assert.equal(x.c.teamParticipant.idParticipant,0);x.c.searchTeams({target:{value:'Alpha'}});assert.equal(x.c.teamParticipant.idParticipant,0);x.c.showParticipants(11);assert.equal(x.c.teamParticipant.name,'Alpha');}finally{x.injector.destroy();}
});

test('el indice recordado es el de la lista filtrada (no el de la lista completa)',()=>{
 assert.equal(indexInShownList([{idParticipant:22}],22),0);assert.equal(indexInShownList([{idParticipant:11},{idParticipant:22}],33),-1);
 const x=fixture();try{x.c.searchTeams({target:{value:'Beta'}});x.c.showParticipants(22);assert.equal(x.clicked.value,0);assert.equal(x.c.particpantsFilter[x.clicked.value].idParticipant,22);}finally{x.injector.destroy();}
});
