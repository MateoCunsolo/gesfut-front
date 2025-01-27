import { Injectable } from '@angular/core';
import { TournamentResponseShort } from '../models/tournamentResponseShort';

@Injectable({
  providedIn: 'root'
})
export class TouranmentCurrentService {


  private touranamentResponseShort: TournamentResponseShort = {
    code: '1',
    name: '1',
    startDate: '1',
    isFinished: false,
    haveParticipants: false,
    isActive: false
  }


  constructor() { }

  setTournamentCurrent(tournamentCurrent: TournamentResponseShort) {
    this.touranamentResponseShort = tournamentCurrent;
    sessionStorage.setItem('tournamentCurrent', JSON.stringify(this.touranamentResponseShort));
  }

  getTournamentCurrent() {
    return JSON.parse(sessionStorage.getItem('tournamentCurrent') || '{}');
  }

  getTournamentCurrentDate() {
    return JSON.parse(sessionStorage.getItem('tournamentCurrent') || '{}').startDate;
  }

  getTournamentCurrentName() {
    return JSON.parse(sessionStorage.getItem('tournamentCurrent') || '{}').name;
  }

  clearTournamentCurrent() {
    sessionStorage.removeItem('tournamentCurrent');
  }
}
