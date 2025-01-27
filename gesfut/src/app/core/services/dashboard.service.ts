import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatchResponse } from '../models/tournamentResponse';

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

  private getNameTournamentSubject = new BehaviorSubject<string>('');
  getNameTournament$ = this.getNameTournamentSubject.asObservable();

  setActiveTournamentComponent(component: string) {
    this.activeTournamentComponentSubject.next(component);
  }

  setActiveDashboardAdminComponent(component: string) {
    this.activeDashboardAdminComponentSubject.next(component);
  }

  setHaveParticipants(thereAre: boolean) {
    this.haveParticipantsSubject.next(thereAre);
  }

  setNameTournament(name: string) {
    this.getNameTournamentSubject.next(name);
  }

}
