import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TeamRequest } from '../../models/teamRequest';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SessionService } from '../manager/session.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  url:string = "http://localhost:8080/api/v1/teams";

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
}
