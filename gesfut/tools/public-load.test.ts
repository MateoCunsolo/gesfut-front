import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createEnvironmentInjector, runInInjectionContext} from '@angular/core';
import {convertToParamMap} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {PublicPageComponent} from '../src/app/pages/public-page/public-page.component';
function fixture(){
 const params=new BehaviorSubject(convertToParamMap({code:'a'}));
 const names=new BehaviorSubject('');const active=new BehaviorSubject('recap');
 const requests:Subject<any>[]=[];
 const service={getTournamentFull(){const request=new Subject<any>();requests.push(request);return request;}};
 const injector=createEnvironmentInjector([],null as any);
 const original=PublicPageComponent.prototype.checkScreenSize;
 PublicPageComponent.prototype.checkScreenSize=function(){};
 let component:PublicPageComponent;
 try{component=runInInjectionContext(injector,()=>new PublicPageComponent(service as any,{paramMap:params} as any,{activeComponent$:active} as any,{getNameTournament$:names,setNameTournament:(name:string)=>names.next(name)} as any));}
 finally{PublicPageComponent.prototype.checkScreenSize=original;}
 component!.ngOnInit();return {component:component!,params,names,requests,injector};
}
test('404 termina la carga, clasifica el error y deja un título que no indica carga',()=>{
 const f=fixture();try{f.requests[0].error(new HttpErrorResponse({status:404}));assert.equal(f.component.loadingTournament,false);assert.equal(f.component.loadError,true);assert.equal(f.component.loadErrorKind,'not-found');assert.equal(f.component.tournamentName,'Torneo');assert.equal(f.requests.length,1);}finally{f.injector.destroy();}
});
test('salir cancela la petición y una respuesta tardía no publica nombre',()=>{
 const f=fixture();f.injector.destroy();assert.equal(f.requests[0].observers.length,0);f.requests[0].next({name:'Anterior'});assert.equal(f.names.value,'');assert.equal(f.params.observers.length,0);
});
test('cambiar de código cancela la petición anterior',()=>{
 const f=fixture();try{f.params.next(convertToParamMap({code:'b'}));assert.equal(f.requests[0].observers.length,0);f.requests[1].next({name:'Actual',isActive:true});assert.equal(f.component.tournamentName,'Actual');assert.equal(f.component.loadError,false);}finally{f.injector.destroy();}
});
