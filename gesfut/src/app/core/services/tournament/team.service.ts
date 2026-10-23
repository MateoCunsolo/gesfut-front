import { map, shareReplay } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayerRequest, TeamRequest } from '../../models/teamRequest';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SessionService } from '../manager/session.service';
import { ParticipantResponse, PlayerParticipantResponse } from '../../models/tournamentResponse';
import { ParticipantShortResponse } from '../../models/participantShortResponse';
import { PlayerResponse, TeamResponse } from '../../models/teamResponse';
import { TeamWithAllStatsPlayerResponse } from '../../models/TeamWithAllStatsPlayerResponse';
import { environment } from '../../../../enviroments/environment';

/** Plan 22/10 #15 */
export interface TeamImportResponse { createdCount: number; created: string[]; failed: { index: number; name: string | null; error: string }[] }

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  url: string = environment.apiUrl+'/teams';

  constructor(private http: HttpClient, private session: SessionService) { }

  /** Recorrido 22/10: alta de varios equipos desde un Excel (POST /teams/create-multiple). */
  /** Plan 22/10 #15: devuelve qué equipos se crearon y cuáles fallaron (import parcial). */
  createMultipleTeams(request: TeamRequest[]): Observable<TeamImportResponse> {
    this.invalidateTeam();
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
    return this.http.post<TeamImportResponse>(`${this.url}/create-multiple`, request, { headers });
  }

  createTeam(request: TeamRequest): Observable<TeamResponse> {
    this.invalidateTeam();
    if (!this.session.isAuth()) {
      return new Observable<TeamResponse>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<TeamResponse>(`${this.url}/create`, request, {
      headers
    }).pipe(
      tap(() => console.log('Equipo creado exitosamente')),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }


  getTeamsTournament(code: string): Observable<ParticipantResponse[]> {

    if (!this.session.isAuth()) {
      return new Observable<ParticipantResponse[]>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ParticipantResponse[]>(`${this.url}/${code}`, {
      headers
    }).pipe(
      tap(() => console.log('Equipos obtenidos exitosamente')),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );

  }


  getParticipantsShortAllTournamemts(id: number): Observable<ParticipantShortResponse[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get<ParticipantShortResponse[]>(`${this.url}/${id}/tournaments`, {
      headers
    }).pipe(
      tap( (response) => response.map(participant => {
        participant.nameTournament = participant.nameTournament.toUpperCase();
      })),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      }),
    );
  }

  changeStatusPlayerGlobal(idPlayer: number, status: boolean): Observable<void> {
    if (!this.session.isAuth()) {
      return new Observable<void>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<void>(
      `${this.url}/change-status-player/${idPlayer}/${status}`,
      null,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al cambiar el estado', error);
        return throwError(() => error);
      })
    );
  }

  // Método para cambiar el estado de un equipo
  changeStatusTeam(idTeam: number, status: boolean): Observable<string> {
    this.invalidateTeam(idTeam);
    if (!this.session.isAuth()) {
      return new Observable<string>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<string>(
      `${this.url}/change-status-team/${idTeam}/${status}`,  // Parámetros en la URL
      null,  // No enviamos un cuerpo en la solicitud PUT
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al cambiar el estado del equipo', error);
        return throwError(() => error);
      })
    );
  }


  addPlayerToTeam(idTeam: number, playerRequest: PlayerRequest): Observable<PlayerResponse> {
    this.invalidateTeam(idTeam);
    if (!this.session.isAuth()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<PlayerResponse>(
      `${this.url}/add-player/${idTeam}`,
      playerRequest,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al agregar el jugador al equipo', error);
        return throwError(() => error);
      })
    );
  }


  // Loop 4: cache del color por equipo; se invalida en cada escritura sobre el equipo.
  private colorCache = new Map<number, Observable<string>>();
  getTeamColor(idTeam: number): Observable<string> {
    let color$ = this.colorCache.get(idTeam);
    if (!color$) {
      color$ = this.getTeam(idTeam).pipe(map(r => r.color), shareReplay(1), catchError(err => { this.colorCache.delete(idTeam); return throwError(() => err); }));
      this.colorCache.set(idTeam, color$);
    }
    return color$;
  }
  invalidateTeam(idTeam?: number): void {
    if (idTeam === undefined) this.colorCache.clear(); else this.colorCache.delete(idTeam);
  }

  getTeam(idTeam: number): Observable<TeamResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',      
    });

    return this.http.get<TeamResponse>(`${this.url}/${idTeam}`, {
      headers
    })
  }


  getAllStatsPlayersFromTeam(idTeam: number): Observable<TeamWithAllStatsPlayerResponse> {
    if (!this.session.isAuth()) {
      return new Observable<TeamWithAllStatsPlayerResponse>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<TeamWithAllStatsPlayerResponse>(`${this.url}/${idTeam}/players-stats`, {
      headers
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener las estadísticas de los jugadores del equipo', error);
        return throwError(() => error);
      })
    );

  }

}