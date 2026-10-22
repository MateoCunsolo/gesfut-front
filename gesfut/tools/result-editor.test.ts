import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { LoadResultComponent } from '../src/app/admin/match-day/load-result/load-result.component';
import { MatchDaysService } from '../src/app/core/services/tournament/match-days.service';
import { INITIAL_DETAILED_MATCH } from '../src/app/core/services/tournament/initial-tournament';

function fixture(){
  const match=structuredClone(INITIAL_DETAILED_MATCH);
  match.id=10;match.homeGoals=0;match.awayGoals=0;match.events=[];
  match.homeTeam.name='Local';match.awayTeam.name='Visitante';
  const player={...match.homeTeam.playerParticipants[0],id:21,playerName:'Jugador',playerLastName:'Uno',isActive:true,isSuspended:false};
  match.homeTeam.playerParticipants=[player];
  const service={currentMatch:new BehaviorSubject(match),editResult:new BehaviorSubject(false),saving:signal(false),saveEvents(){},saveEditEvents(){}};
  const errors:string[]=[];
  const injector=createEnvironmentInjector([{provide:MatchDaysService,useValue:service}],null as any);
  const component=runInInjectionContext(injector,()=>new LoadResultComponent(service as any,new FormBuilder(),{setActiveTournamentComponent(){}} as any,{errorAlert:(message:string)=>errors.push(message)} as any,{observe:()=>of({matches:true})} as any));
  component.ngOnInit();
  const choose=()=>{component.statisticsForm.get('team')!.setValue(component.currentMatch.homeTeam);component.statisticsForm.get('name')!.setValue(component.currentMatch.homeTeam.playerParticipants[0]);};
  return {component,service,match,errors,injector,choose};
}

test('editar el borrador no cambia el marcador publicado y abrir otro partido limpia eventos',()=>{
  const x=fixture();try{x.choose();x.component.statisticsForm.get('goals')!.setValue(2);x.component.loadStatistics();assert.equal(x.component.currentMatch.homeGoals,2);assert.equal(x.match.homeGoals,0);assert.equal(x.service.currentMatch.value.homeGoals,0);x.service.currentMatch.next({...x.match,id:11,events:[]});assert.equal(x.component.events.length,0);assert.equal(x.component.eventsCopy.length,0);}finally{x.injector.destroy();}
});

test('dos amarillas agregan la roja aunque no se dispare un evento DOM change',()=>{
  const x=fixture();try{x.choose();x.component.statisticsForm.get('yellowCard')!.setValue(2);assert.equal(x.component.statisticsForm.get('redCard')!.value,1);x.component.loadStatistics();assert.equal(x.component.events[0].yellowCard,2);assert.equal(x.component.events[0].redCard,1);}finally{x.injector.destroy();}
});

test('reagregar estadísticas no supera el máximo de tarjetas ni cambia el marcador al rechazarlas',()=>{
  const x=fixture();try{x.choose();x.component.statisticsForm.get('yellowCard')!.setValue(2);x.component.loadStatistics();x.choose();x.component.statisticsForm.patchValue({yellowCard:1,goals:3});x.component.loadStatistics();assert.equal(x.component.events[0].yellowCard,2);assert.equal(x.component.currentMatch.homeGoals,0);assert.equal(x.errors.length,1);}finally{x.injector.destroy();}
});

test('elegir otro MVP reemplaza al anterior; bajar goles respeta cero',()=>{
  const x=fixture();try{x.component.events=[{id:1,team:'Local',name:'Uno',goals:1,yellowCard:0,redCard:0,mvp:true},{id:2,team:'Visitante',name:'Dos',goals:0,yellowCard:0,redCard:0,mvp:false}];x.component.currentMatch.homeGoals=1;x.component.changeMvpStatus(2);assert.deepEqual(x.component.events.map(e=>e.mvp),[false,true]);x.component.removeGoal(1);assert.equal(x.component.currentMatch.homeGoals,0);x.component.removeGoal(1);assert.equal(x.component.currentMatch.homeGoals,0);}finally{x.injector.destroy();}
});

test('no guardar un jugador con estadísticas que aún no fueron agregadas al registro',()=>{
  const x=fixture();try{let sent=false;x.service.saveEvents=()=>{sent=true;};x.choose();x.component.statisticsForm.get('goals')!.setValue(1);x.component.saveEvents();assert.equal(sent,false);assert.match(x.errors[0],/antes de guardar/);}finally{x.injector.destroy();}
});

test('quitar un gol a un registro en cero no resta los goles de otro jugador',()=>{
 const x=fixture();try{x.component.events=[{id:1,team:'Local',name:'Uno',goals:0,yellowCard:0,redCard:0,mvp:false},{id:2,team:'Local',name:'Dos',goals:2,yellowCard:0,redCard:0,mvp:false}];x.component.currentMatch.homeGoals=2;x.component.removeGoal(1);assert.equal(x.component.currentMatch.homeGoals,2);assert.equal(x.component.events[1].goals,2);}finally{x.injector.destroy();}
});

test('al salir del editor se limpian las suscripciones de los partidos',()=>{
 const x=fixture();assert.equal(x.service.currentMatch.observers.length,1);assert.equal(x.service.editResult.observers.length,1);x.injector.destroy();assert.equal(x.service.currentMatch.observers.length,0);assert.equal(x.service.editResult.observers.length,0);
});

test('el borrador y los cambios del registro se detectan y volver respeta cancelar',async()=>{
 const x=fixture();try{
  assert.equal(x.component.hasPendingChanges,false);
  x.choose();x.component.statisticsForm.get('goals')!.setValue(1);
  assert.equal(x.component.hasPendingChanges,true);
  let left=0;let prompts=0;
  (x.component as any).DashboardService={setActiveTournamentComponent(){left++;}};
  (x.component as any).alertService.confirmAlert=async()=>{prompts++;return {isConfirmed:false};};
  await x.component.btnBack();assert.equal(left,0);assert.equal(prompts,1);
  x.component.loadStatistics();assert.equal(x.component.hasPendingChanges,true);
  (x.component as any).alertService.confirmAlert=async()=>({isConfirmed:true});
  await x.component.btnBack();assert.equal(left,1);
 }finally{x.injector.destroy();}
});

test('volver sin cambios no pregunta y durante guardado no abandona',async()=>{
 const x=fixture();try{
  let left=0;(x.component as any).DashboardService={setActiveTournamentComponent(){left++;}};
  await x.component.btnBack();assert.equal(left,1);
  x.service.saving.set(true);await x.component.btnBack();assert.equal(left,1);
 }finally{x.injector.destroy();}
});

test('editar registro existente pliega el alta y un partido vacío la abre',()=>{
 const x=fixture();try{
  x.service.editResult.next(true);
  x.service.currentMatch.next({...x.match,events:[{idPlayerParticipant:21,playerName:'Jugador Uno',teamName:'Local',type:'GOAL',quantity:1}] as any});
  assert.equal(x.component.entryOpen,false);assert.equal(x.component.hasPendingChanges,false);
  x.service.currentMatch.next({...x.match,id:12,events:[]});assert.equal(x.component.entryOpen,true);
 }finally{x.injector.destroy();}
});

test('salidas simultáneas comparten confirmación y cancelar permite volver a consultar',async()=>{
 const x=fixture();try{
  x.choose();x.component.statisticsForm.get('goals')!.setValue(1);
  let resolve:any;let prompts=0;
  (x.component as any).alertService.confirmAlert=()=>{prompts++;return new Promise(r=>resolve=r);};
  const first=x.component.canLeave();const second=x.component.canLeave();
  assert.equal(first,second);assert.equal(prompts,1);
  resolve({isConfirmed:false});assert.equal(await first,false);
  const third=x.component.canLeave();assert.equal(prompts,2);
  resolve({isConfirmed:true});assert.equal(await third,true);
 }finally{x.injector.destroy();}
});

test('recargar avisa solo si hay cambios o un guardado en curso',()=>{
 const x=fixture();try{
  let prevented=0;const event={preventDefault(){prevented++;},returnValue:undefined} as any;
  x.component.beforeUnload(event);assert.equal(prevented,0);
  x.choose();x.component.statisticsForm.get('goals')!.setValue(1);
  x.component.beforeUnload(event);assert.equal(prevented,1);assert.equal(event.returnValue,'');
  x.component.statisticsForm.get('goals')!.setValue(0);x.service.saving.set(true);
  x.component.beforeUnload(event);assert.equal(prevented,2);
 }finally{x.injector.destroy();}
});
