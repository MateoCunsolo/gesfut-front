import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuestService {

  activeComponent:BehaviorSubject<string>=new BehaviorSubject<string>('recap');
  activeComponent$ = this.activeComponent.asObservable();
  constructor() { }

  getActiveComponent():string{
    return this.activeComponent.value;
  }

  setActiveComponent(component:string){
    this.activeComponent.next(component);
  }
}
