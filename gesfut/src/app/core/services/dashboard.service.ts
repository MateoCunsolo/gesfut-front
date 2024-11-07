import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private activeTournamentComponentSubject = new BehaviorSubject<string>('dashboard');
  activeTournamentComponent$ = this.activeTournamentComponentSubject.asObservable();

  private activeDashboardAdminComponentSubject = new BehaviorSubject<string>('dashboard');
  activeDashboardAdminComponent$ = this.activeDashboardAdminComponentSubject.asObservable();
  
  private haveParticipantsSubject = new BehaviorSubject<boolean>(false);
  haveParticipants$ = this.haveParticipantsSubject.asObservable();

  setActiveTournamentComponent(component: string) {
    this.activeTournamentComponentSubject.next(component);
  }
  
  setActiveDashboardAdminComponent(component: string) {
    this.activeDashboardAdminComponentSubject.next(component);
  }

  setHaveParticipants(thereAre: boolean) {
    this.haveParticipantsSubject.next(thereAre);
  }

}
