import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import { INITIAL_DETAILED_MATCH} from './initial-tournament';
import { environment } from '../../../../enviroments/environment';
import { MatchDetailedResponse } from '../../models/matchDetailedRequest';
import { EventRequest, MatchRequest } from '../../models/matchRequest';
import { DashboardService } from '../dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class MatchDaysService {

  url:string=environment.apiUrl;

  currentMatch: BehaviorSubject<MatchDetailedResponse> = new BehaviorSubject<MatchDetailedResponse>(INITIAL_DETAILED_MATCH);


  constructor(private HttpClient:HttpClient, private dashboardService:DashboardService) { }

  getMatchDetailed(id: number): Observable<MatchDetailedResponse> {
    return this.HttpClient.get<MatchDetailedResponse>(`${this.url}/matches/detailed/${id}`).pipe(
      tap({
        next: (response: MatchDetailedResponse) => {
          console.log(response);
          return response;
        },
        error: (error:HttpErrorResponse) => {
          return throwError(() => error);
        }
      }
    ));
  }

  closeMatchDay(idMatchDay: number, status: boolean): Observable<void> {
    const token = sessionStorage.getItem('token');
    
    return this.HttpClient.put<void>(`${this.url}/match-days/close?matchDayId=${idMatchDay}&status=${status}`, null, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError(error => {
        console.error('Error closing match day:', error);
        return throwError(() => new Error('Failed to close match day'));
      })
    );
  }
  
  

  setActiveMatch(id:number){
    this.getMatchDetailed(id).subscribe({
      next: (response:MatchDetailedResponse) => {
        this.currentMatch.next(response);
      },
      error: (error) => {
        return throwError(()=> error);
      }
    })
  }

 
  saveEvents(events: any[], matchId: number): void {
    console.log('Array de eventos recibidos en el servicio:', events);
    const request = this.generateMatchRequest(events, matchId);
    const token = sessionStorage.getItem('token');

    console.log(request);
    this.HttpClient.post<MatchRequest>(`${this.url}/matches/load-result`, request, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text' as 'json'
    })
    .pipe(
      catchError(error => {

        console.error('Error al guardar los eventos:', error);
        return of('Error al guardar los eventos');
      })
    )
    .subscribe({
      next: (response) => {
        console.log('Eventos guardados correctamente:', response);
        this.dashboardService.setActiveTournamentComponent('match-days')
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      }
    });
  }

  generateMatchRequest(events: any[], matchId:number): MatchRequest {
    const eventRequests: EventRequest[] = [];
  
    events.forEach(event => {
      if (event.goals > 0) {
        eventRequests.push({
          playerParticipantId: event.id, 
          type: 'GOAL',
          quantity: event.goals
        });
      }

      if (event.yellowCard > 0) {
        eventRequests.push({
          playerParticipantId: event.id,
          type: 'YELLOW_CARD',
          quantity: event.yellowCard
        });
      }
  
      if (event.redCard > 0) {
        eventRequests.push({
          playerParticipantId: event.id,
          type: 'RED_CARD',
          quantity: event.redCard
        });
      }

      if(event.mvp===true){
        eventRequests.push({
          playerParticipantId: event.id,
          type: 'MVP',
          quantity: 1
        });
      }
    });
  
    return {
      matchId: matchId,
      events: eventRequests
    };
  }
}
