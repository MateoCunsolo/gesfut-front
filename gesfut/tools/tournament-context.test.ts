import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createEnvironmentInjector, runInInjectionContext} from '@angular/core';
import {convertToParamMap} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {AdminTournamentPageComponent} from '../src/app/pages/admin-tournament-page/admin-tournament-page.component';

function fixture() {
 const route = new BehaviorSubject(convertToParamMap({code:'a'}));
 const calls: {code:string,short:Subject<any>,full:Subject<any>}[]=[];
 const names:string[]=[];
 const active=new BehaviorSubject('dashboard');
 const participants=new BehaviorSubject(false);
 const dashboard={activeTournamentComponent$:active,haveParticipants$:participants,
  setNameTournament:(name:string)=>names.push(name),
  setHaveParticipants:(value:boolean)=>participants.next(value),
  setActiveTournamentComponent:(value:string)=>active.next(value)};
 const service={getTournamentShort(code:string){const call={code,short:new Subject<any>(),full:new Subject<any>()};calls.push(call);return call.short;},
  getTournamentFull(){return calls[calls.length-1].full;}};
 const injector=createEnvironmentInjector([],null as any);
 const component=runInInjectionContext(injector,()=>new AdminTournamentPageComponent(dashboard as any,service as any,{paramMap:route} as any));
 component.ngOnInit();
 function resolve(index:number,name:string,haveParticipants=true){const call=calls[index];call.short.next({haveParticipants});call.short.complete();call.full.next({code:call.code,name});call.full.complete();}
 return {component,route,calls,names,active,injector,resolve};
}

test('el encabezado corresponde a la respuesta del código solicitado',()=>{
 const f=fixture();try{assert.equal(f.component.isLoading,true);f.resolve(0,'Torneo A');assert.equal(f.names.at(-1),'Torneo A');assert.equal(f.component.isLoading,false);assert.equal(f.component.activeComponent,'recap');}finally{f.injector.destroy();}
});
test('cambiar de torneo cancela las peticiones anteriores y no restaura su nombre',()=>{
 const f=fixture();try{f.route.next(convertToParamMap({code:'b'}));assert.equal(f.calls[0].full.observers.length,0);f.resolve(1,'Torneo B');f.resolve(0,'Torneo A');assert.equal(f.names.at(-1),'Torneo B');assert.equal(f.component.code,'b');}finally{f.injector.destroy();}
});
test('un error permite reintentar y un torneo sin equipos abre preparación',()=>{
 const f=fixture();try{f.calls[0].short.error(new Error('sin conexión'));assert.equal(f.component.loadError,true);assert.equal(f.component.isLoading,false);f.component.retryLoad();assert.equal(f.component.loadError,false);f.resolve(1,'Nuevo',false);assert.equal(f.component.activeComponent,'dashboard');assert.equal(f.component.flag,false);}finally{f.injector.destroy();}
});
test('salir de la página libera suscripciones y respuestas pendientes',()=>{
 const f=fixture();f.injector.destroy();assert.equal(f.route.observers.length,0);assert.equal(f.active.observers.length,0);assert.equal(f.calls[0].short.observers.length,0);assert.equal(f.calls[0].full.observers.length,0);
});
