import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TournamentCodeService {

  tournamentCode:string = '';

  constructor() { }

  setTournamentCode(code:string){
    this.tournamentCode=code;
  }

  getTournamentCode(){
    return this.tournamentCode;
  }
}
