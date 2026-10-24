import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/environment';
import { BehaviorSubject, Observable, catchError, map, shareReplay, tap, throwError } from 'rxjs';
import { TournamentCache } from './tournament-cache';
import { MatchResponse, ParticipantResponse, TournamentResponseFull } from '../../models/tournamentResponse';
import { INITIAL_TOURNAMENT, INITIAL_TOURNAMENT_SHORT } from './initial-tournament';
import { TournamentResponseShort } from '../../models/tournamentResponseShort';
import { ParticipantShortResponse } from '../../models/participantShortResponse';
import { SessionService } from '../manager/session.service';
import { PlayerRequest } from '../../models/teamRequest';
import { TeamResponse } from '../../models/teamResponse';
import { compareStandings } from '../../utils/standings';

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

  private tournamentCache = inject(TournamentCache);

  /** Fuerza la próxima lectura desde el servidor (sin código: todos los torneos). */
  invalidateTournament(code?: string): void {
    this.tournamentCache.invalidate(code);
  }

  /**
   * Torneo completo con caché por código (shareReplay(1), 60 s). Varias pantallas que lo piden
   * comparten una sola request. Si falla se quita de la caché para que "Reintentar" vuelva a pedirlo.
   * Toda escritura exitosa invalida la caché (tournamentCacheInterceptor).
   */
  getTournamentFull(code: string, forceRefresh = false): Observable<TournamentResponseFull> {
    if (forceRefresh) this.tournamentCache.invalidate(code);
    let request$ = this.tournamentCache.get(code);
    if (!request$) {
      request$ = this.fetchTournamentFull(code).pipe(
        catchError(error => { this.tournamentCache.invalidate(code); return throwError(() => error); }),
        shareReplay(1)
      );
      this.tournamentCache.set(code, request$);
    }
    return request$.pipe(tap(response => this.currentTournament.next(response)));
  }

  private fetchTournamentFull(code: string): Observable<TournamentResponseFull> {
    return this.http.get<TournamentResponseFull>(`${this.url}/tournaments/${code}`).pipe(
      map((response: TournamentResponseFull) => {
          response.participants = response.participants.filter(participant => participant.name.toLocaleLowerCase() != 'free');
          response.matchDays.sort((a, b) => a.numberOfMatchDay - b.numberOfMatchDay);
          response.participants.sort((a, b) => compareStandings(a.statistics, b.statistics));
          return response;
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
    const url = `${this.url}/team-participant/change-status/${idParticipant}/${status}`;
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

  /** Revisión crítica #4: reglas de sanción del torneo. */
  updateDiscipline(code: string, yellowCardsToSuspend: number, redCardSuspensionMatches: number): Observable<void> {
    return this.http.put<void>(`${this.url}/tournaments/${code}/discipline`, { yellowCardsToSuspend, redCardSuspensionMatches }).pipe(
      tap(() => this.getTournamentFull(code).subscribe()));
  }

  /** Revisión crítica #2: finalizar es explícito e irreversible. */
  finishTournament(code: string): Observable<void> {
    return this.http.put<void>(`${this.url}/tournaments/${code}/finish`, null).pipe(
      tap(() => this.getTournamentFull(code).subscribe()));
  }

  generatePlayOffs(teamsIdQualify: Number[], code: string, schedule: { startDate: string; minutesPerMatch: number }): Observable<void> {
    const url = `${this.url}/tournaments/generate-playoffs/${code}?startDate=${encodeURIComponent(schedule.startDate)}&minutesPerMatch=${schedule.minutesPerMatch}`;
    return this.http.put<void>(url, teamsIdQualify, { 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    }).pipe(
      tap({
        next: () => {
          this.getTournamentFull(code).subscribe({
            next: (response) => {
              this.currentTournament.next(response);
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          return throwError(() => error)
        }
      }));
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

  setDateToInitTournament({ date, minutes, days }: { date: string, minutes: number, days: number }) {
    this.recentDate.next({ date, minutes, days });
  }

}
