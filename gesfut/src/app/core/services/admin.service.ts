import { Injectable, inject } from '@angular/core';
import { TournamentRequest } from '../models/tournamentRequest';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TournamentResponse, TournamentResponseFull } from '../models/tournamentResponse';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { TeamResponse } from '../models/teamResponse';
import { InitializeRequest } from '../models/initializeRequest';
import { TournamentCodeService } from './tournament-code.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private url = 'http://localhost:8080/api/v1';
  
  private tournamentSubject = new BehaviorSubject<TournamentResponseFull | null>(null);
  tournamentData$ = this.tournamentSubject.asObservable();

  private sessionService = inject(SessionService);
  private http = inject(HttpClient);
  private codeService = inject(TournamentCodeService);

  getTournament(code: string): Observable<TournamentResponseFull> {
    const currentTournament = this.tournamentSubject.getValue();
    if (currentTournament && currentTournament.code === code) {
      return of(currentTournament);
    }
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponseFull>();
    }

    const token = sessionStorage.getItem('token');
    return this.http.get<TournamentResponseFull>(`${this.url}/tournaments/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap((response) => {
        console.log('Torneo obtenido:', response);
        this.tournamentSubject.next(response); // Actualizamos el BehaviorSubject con el nuevo valor
        this.codeService.setTournamentCode(response.code);
      }),
      map((response: TournamentResponseFull) => ({
        name: response.name,
        code: response.code,
        startDate: response.startDate,
        manager: response.manager,
        isFinished: response.isFinished,
        participants: response.participants,
        matchDays: response.matchDays,
      }))
    );
  }

  createTournament(tournament: TournamentRequest): Observable<TournamentResponse> {
    const userCurrent = this.sessionService.isAuth();
    if (!userCurrent) {
      return new Observable<TournamentResponse>();
    }

    const token = sessionStorage.getItem('token');

    return this.http.post<string>(`${this.url}/tournaments`, tournament, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text' as 'json' // Se especifica que la respuesta es texto
    }).pipe(
      map((response: string) => {
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

  clearTournamentData(): void {
    this.tournamentSubject.next(null);
  }

}
