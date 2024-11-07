import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/environment';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ParticipantResponse, TournamentResponseFull } from '../../models/tournamentResponse';
import { ParticipantResponseShort } from '../../models/participantResponse';
import { INITIAL_TOURNAMENT } from './initial-tournament';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  currentTournament: BehaviorSubject<TournamentResponseFull> = new BehaviorSubject<TournamentResponseFull>(INITIAL_TOURNAMENT);

  url=environment.apiUrl;

  constructor(private http:HttpClient) { }

  getTournamentFull(code:string):Observable<TournamentResponseFull>{
    return this.http.get<TournamentResponseFull>(`${this.url}/tournaments/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap({
        next: (response:TournamentResponseFull) => {
          this.currentTournament.next(response)
          return response;
        },
        error: (error:HttpErrorResponse) => {
          return throwError(() => error)
        }
      })
    );
  }

  

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
