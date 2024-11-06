import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/environment';
import { Observable } from 'rxjs';
import { ParticipantResponse } from '../../models/tournamentResponse';
import { ParticipantResponseShort } from '../../models/participantResponse';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  url=environment.apiUrl;

  constructor(private http:HttpClient) { }

  tournamentExists(code:String):Observable<boolean>{
    return this.http.get<boolean>(`${this.url}/tournaments/exist/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }


  getTournamentsParticipantTeamsShort(code:string):Observable<ParticipantResponseShort[]>{
    return this.http.get<ParticipantResponseShort[]>(`${this.url}/tournaments/${code}/teams-short`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }


  getTournamentParticipantsTeams(code:string):Observable<ParticipantResponse[]>{
    return this.http.get<ParticipantResponse[]>(`${this.url}/tournaments/${code}/teams`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }


  getTournamentParticipantTeamByID(id:number):Observable<ParticipantResponse>{
    return this.http.get<ParticipantResponse>(`${this.url}/tournaments/teams/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });

  }


}
