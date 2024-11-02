import { Injectable } from '@angular/core';
import { TournamentRequest } from '../models/tournamentRequest';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TournamentResponse, TournamentResponseFull } from '../models/tournamentResponse';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { TeamResponse } from '../models/teamResponse';
import { TeamRequest } from '../models/teamRequest';
import { InitializeRequest } from '../models/initializeRequest';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  


  url = 'http://localhost:8080/api/v1';

  constructor(
    private sessionService: SessionService,
    private http: HttpClient
  ){}

  getTournament(code:string) : Observable<TournamentResponseFull> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponseFull>();
    }
    const token = sessionStorage.getItem('token');
    return this.http.get<TournamentResponseFull>(`${this.url}/tournaments/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }}).pipe(
        map((response: TournamentResponseFull) => {
          console.log(response);
          const TournamentResponseFull: TournamentResponseFull = {
            name: response.name,
            code: response.code,
            startDate: response.startDate,
            manager: response.manager,
            isFinished: response.isFinished,
            participants: response.participants,
            matchDays: response.matchDays,
          };
          return TournamentResponseFull;})
      );
  }
  
  createTournament(tournament: TournamentRequest): Observable<TournamentResponse> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponse>();
    }
    const token = sessionStorage.getItem('token');

    return this.http.post(`${this.url}/tournaments`, tournament, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text' 
    }).pipe(
      map((response) => {
        const tournamentResponse: TournamentResponse = {
          code: response
        };
        return tournamentResponse;
      })
    );
  }

  
  getTeams(): Observable<TeamResponse[]> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TeamResponse[]>();
    }
    const token = sessionStorage.getItem('token');
    return this.http.get<TeamResponse[]>(`${this.url}/teams`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }}).pipe(
        map((response: TeamResponse[]) => {
          console.log('Equipos antes del filtro:', response);
          return response.filter(t => t.name.trim().toLowerCase() !== 'free');
        })
      );
  }
  

  initTournament(init: InitializeRequest): Observable<TournamentResponse> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return EMPTY;
    }
  
    const token = sessionStorage.getItem('token');
    
    // Verificar que init tiene los valores esperados
    console.log('Contenido de init:', init);
    
    return this.http.post<string>(`${this.url}/tournaments/initialize`, init, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text' as 'json'
    }).pipe(
      map((response: string) => {
        const tournamentResponse: TournamentResponse = {
          code: response
        };
        return tournamentResponse;
      })
    );
  }
  

  
}
