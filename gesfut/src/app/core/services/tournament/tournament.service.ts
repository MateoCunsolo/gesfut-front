import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/environment';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { MatchResponse, ParticipantResponse, TournamentResponseFull } from '../../models/tournamentResponse';
import { INITIAL_TOURNAMENT, INITIAL_TOURNAMENT_SHORT } from './initial-tournament';
import { TournamentResponseShort } from '../../models/tournamentResponseShort';
import { ParticipantShortResponse } from '../../models/participantShortResponse';
import { SessionService } from '../manager/session.service';
import { PlayerRequest } from '../../models/teamRequest';
import { TeamResponse } from '../../models/teamResponse';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  currentTournament: BehaviorSubject<TournamentResponseFull> = new BehaviorSubject<TournamentResponseFull>(INITIAL_TOURNAMENT);
  currentListTournaments: BehaviorSubject<TournamentResponseShort[]> = new BehaviorSubject<TournamentResponseShort[]>([]);
  currentTournamentShort: BehaviorSubject<TournamentResponseShort> = new BehaviorSubject<TournamentResponseShort>(INITIAL_TOURNAMENT_SHORT)
  lastTeamClicked: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  matches: BehaviorSubject<MatchResponse[]> = new BehaviorSubject<MatchResponse[]>([]);
  $matches = this.matches.asObservable();
  teamName: BehaviorSubject<string> = new BehaviorSubject<string>('');
  $teamName = this.teamName.asObservable();
  currentTeamsToInitTournament: BehaviorSubject<TeamResponse[]> = new BehaviorSubject<TeamResponse[]>([]);
  $currentTeamsToInitTournament = this.currentTeamsToInitTournament.asObservable();
  recentlyTeamCreated: BehaviorSubject<TeamResponse> = new BehaviorSubject<TeamResponse>({} as TeamResponse);
  $recentlyTeamCreated = this.recentlyTeamCreated.asObservable();

  recentDate: BehaviorSubject<{
    date: string,
    minutes: number,
    days: number;
  }> = new BehaviorSubject<{
    date: string,
    minutes: number,
    days: number;
  }>({
    date: '',
    minutes: 0,
    days: 0
  });
  $recentDate = this.recentDate.asObservable();

  private sessionService = inject(SessionService);
  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTournamentFull(code: string): Observable<TournamentResponseFull> {
    return this.http.get<TournamentResponseFull>(`${this.url}/tournaments/${code}`).pipe(
      tap({
        next: (response: TournamentResponseFull) => {
          response.participants = response.participants.filter(participant => participant.name.toLocaleLowerCase() != 'free');
          response.matchDays.sort((a, b) => a.numberOfMatchDay - b.numberOfMatchDay);
          this.currentTournament.next(response)
          return response;
        },
        error: (error: HttpErrorResponse) => {
          return throwError(() => error)
        }
      })
    );
  }


  getMatchesAllForParticipant(code: string, idParticipant: number): Observable<MatchResponse[]> {
    let url = `${this.url}/tournaments/${code}/matches/${idParticipant}`;
    return this.http.get<MatchResponse[]>(`${url}`);
  }


  isMyTournament(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/tournaments/is-my-tournament/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap({
        next: (response: boolean) => {
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
    return this.http.get<ParticipantResponse[]>(`${this.url}/team-participant/${code}/teams`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }


  getTournamentParticipantTeamByID(id: number): Observable<ParticipantResponse> {
    return this.http.get<ParticipantResponse>(`${this.url}/team-participant/teams/${id}`);
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
    return this.http.get<TournamentResponseShort>(`${this.url}/tournaments/short/${code}`)
  }


  changeStatusPlayerParticipant(idParticipant: number, status: boolean) {
    const url = `http://localhost:8080/api/v1/team-participant/change-status/${idParticipant}/${status}`;
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

  changeIsActive(code: string, isActive: boolean): Observable<boolean> {
    const url = `${this.url}/tournaments/change-isActive/${code}/${isActive}`;
    return this.http.put<boolean>(`${url}`, {}, {
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


  addPlayerToParticipant(code: string, teamIdParticipant: number, player: PlayerRequest): Observable<ParticipantResponse> {
    const url = `${this.url}/team-participant/${code}/add-player/${teamIdParticipant}`;
    return this.http.put<ParticipantResponse>(`${url}`, player, {
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

      }))
  }

  setLastTeamClicked(id: number) {
    this.lastTeamClicked.next(id);
  }

  getLastTeamClicked(): Observable<number> {
    return this.lastTeamClicked.asObservable();
  }

  setMatches(matches: MatchResponse[]) {
    this.matches.next(matches);
  }

  setNameTeamToViewEvents(teamName: string) {
    this.teamName.next(teamName);
  }

  setTeamsToInitTournament(teams: TeamResponse[]) {
    this.currentTeamsToInitTournament.next(teams);
  }

  setNewTeamToInitTournament(team: TeamResponse) {
    this.recentlyTeamCreated.next(team);
  }

  setDateToInitTournament({date, minutes, days}: {date: string, minutes: number, days: number}) {
    this.recentDate.next({date, minutes, days});
  }

}
