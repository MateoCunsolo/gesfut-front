import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/environment';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { ParticipantResponse, TournamentResponseFull } from '../../models/tournamentResponse';
import { INITIAL_TOURNAMENT, INITIAL_TOURNAMENT_SHORT } from './initial-tournament';
import { TournamentResponseShort } from '../../models/tournamentResponseShort';
import { ParticipantShortResponse } from '../../models/participantShortResponse';
import { SessionService } from '../manager/session.service';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  currentTournament: BehaviorSubject<TournamentResponseFull> = new BehaviorSubject<TournamentResponseFull>(INITIAL_TOURNAMENT);
  currentListTournaments: BehaviorSubject<TournamentResponseShort[]> = new BehaviorSubject<TournamentResponseShort[]>([]);
  currentTournamentShort: BehaviorSubject<TournamentResponseShort> = new BehaviorSubject<TournamentResponseShort>(INITIAL_TOURNAMENT_SHORT)
  private sessionService = inject(SessionService);
  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTournamentFull(code: string): Observable<TournamentResponseFull> {
    return this.http.get<TournamentResponseFull>(`${this.url}/tournaments/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap({
        next: (response: TournamentResponseFull) => {
          this.currentTournament.next(response)
          this
          return response;
        },
        error: (error: HttpErrorResponse) => {
          return throwError(() => error)
        }
      })
    );
  }







  tournamentExists(code: String): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/tournaments/exist/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }


  getTournamentParticipantsTeams(code: string): Observable<ParticipantResponse[]> {
    return this.http.get<ParticipantResponse[]>(`${this.url}/tournaments/${code}/teams`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }


  getTournamentParticipantTeamByID(id: number): Observable<ParticipantResponse> {
    return this.http.get<ParticipantResponse>(`${this.url}/tournaments/teams/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }


  getTournamentShortList(): Observable<TournamentResponseShort[]> {
    return this.http.get<TournamentResponseShort[]>(`${this.url}/tournaments/short`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap({
        next: (response: TournamentResponseShort[]) => {
          this.currentListTournaments.next(response);
          return response;
        },
        error: (error: HttpErrorResponse) => {
          return throwError(() => error)
        }
      })
    );
  }

  getTournamentShort(code: string): Observable<TournamentResponseShort> {
    return this.http.get<TournamentResponseShort>(`${this.url}/tournaments/short/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  }


  changeStatusPlayer(code: string, idParticipant: number, status: boolean) {
    const url = `http://localhost:8080/api/v1/tournaments/change-status/${code}/${idParticipant}/${status}`;
    return this.http.put<void>(`${url}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }


  changeNameTournament(code: string, name: string): Observable<Boolean> {
    if (!this.sessionService.isAuth()) {
      return throwError(() => new Error('No estas autenticado'));
    }

    const url = `${this.url}/tournaments/change-name-tournament/${code}/${name}`;
    return this.http.put<Boolean>(`${url}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap({
        next: () => {
          return;
        },
        error: (error: HttpErrorResponse) => {
          return throwError(() => error)
        }
      })
    );
  }



}
