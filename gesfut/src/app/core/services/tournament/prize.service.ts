import { Prize, PrizesRequest } from './../../models/prizesRequest';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import { AlertService } from '../alert.service';
import { SessionService } from '../manager/session.service';

@Injectable({
  providedIn: 'root',
})
export class PrizeService {
  currentCategory: BehaviorSubject<string> = new BehaviorSubject<string>(
    'POSITION'
  );
  currentView: BehaviorSubject<string> = new BehaviorSubject<string>('list');

  constructor(
    private Http: HttpClient,
    private alertService: AlertService,
    private session: SessionService
  ) {}

  sendPrizes(request: PrizesRequest): Observable<void> {
    if (!this.session.isAuth()) {
      return new Observable<void>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.Http.post<void>(`${environment.apiUrl}/prizes`, request, {
      headers,
    }).pipe(
      tap(() =>
        this.alertService.successAlert('Premios enviados exitosamente')
      ),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getAllPrizes(code: string): Observable<Prize[]> {
    return this.Http.get<Prize[]>(`${environment.apiUrl}/prizes/${code}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        return throwError(() => error);
      })
    );
  }

  getAllPrizesByCategory(code: string, category: string): Observable<Prize[]> {
    return this.Http.get<Prize[]>(
      `${environment.apiUrl}/prizes/${code}/${category}`
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        return throwError(() => error);
      })
    );
  }
}
