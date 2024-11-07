import { Injectable, inject } from '@angular/core';
import { TournamentRequest } from '../../models/tournamentRequest';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TournamentResponse, TournamentResponseFull } from '../../models/tournamentResponse';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { TeamResponse } from '../../models/teamResponse';
import { InitializeRequest } from '../../models/initializeRequest';
import { TournamentResponseShort } from '../../models/tournamentResponseShort';
import { environment } from '../../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private url = environment.apiUrl;
  
  private sessionService = inject(SessionService);
  private http = inject(HttpClient);

  getTournamentShortList(): Observable<TournamentResponseShort[]> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponseShort[]>();
    }
    return this.http.get<TournamentResponseShort[]>(`${this.url}/tournaments/short`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  }

  getTournamentShort(code: string): Observable<TournamentResponseShort> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponseShort>();
    }
    return this.http.get<TournamentResponseShort>(`${this.url}/tournaments/short/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap((response) => {
        console.log('Torneos obtenidos:', response);
      }),
      map((tournament: TournamentResponseShort) => ({
        name: tournament.name,
        code: tournament.code,
        startDate: tournament.startDate,
        isFinished: tournament.isFinished,
        haveParticipants: tournament.haveParticipants
      }))
    );
  }







  createTournament(tournament: TournamentRequest): Observable<TournamentResponse> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponse>();
    }

    const token = sessionStorage.getItem('token');

    return this.http.post<TournamentResponse>(`${this.url}/tournaments`, tournament, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text' as 'json'
    });
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
      }
    }).pipe(
      map((response) => {
        console.log('Equipos antes del filtro:', response);
        return response.filter(team => team.name.trim().toLowerCase() !== 'free');
      })
    );
  }

  initTournament(init: InitializeRequest): Observable<TournamentResponse> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return EMPTY;
    }

    const token = sessionStorage.getItem('token');
    console.log('Contenido de init:', init);

    return this.http.post<string>(`${this.url}/tournaments/initialize`, init, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text' as 'json'
    }).pipe(
      map((response: string) => ({
        code: response
      }))
    );
  }

}
