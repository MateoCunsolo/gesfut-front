import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayerRequest, TeamRequest } from '../../models/teamRequest';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SessionService } from '../manager/session.service';
import { ParticipantResponse, PlayerParticipantResponse } from '../../models/tournamentResponse';
import { ParticipantShortResponse } from '../../models/participantShortResponse';
import { TeamResponse } from '../../models/teamResponse';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  url: string = "http://localhost:8080/api/v1/teams";

  constructor(private http: HttpClient, private session: SessionService) { }

  createTeam(request: TeamRequest): Observable<void> {
    if (!this.session.isAuth()) {
      return new Observable<void>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<void>(`${this.url}/create`, request, {
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
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  changeStatusPlayerGlobal(idPlayer: number, status: boolean): Observable<string> {
    if (!this.session.isAuth()) {
      return new Observable<string>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<string>(
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


  addPlayerToTeam(idTeam: number, playerRequest: PlayerRequest): Observable<string> {
    if (!this.session.isAuth()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<string>(
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


  getTeam(idTeam: number): Observable<TeamResponse> {
    if (!this.session.isAuth()) {
      return new Observable<TeamResponse>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<TeamResponse>(`${this.url}/${idTeam}`, {
      headers
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener el equipo', error);
        return throwError(() => error);
      }))
  }


}