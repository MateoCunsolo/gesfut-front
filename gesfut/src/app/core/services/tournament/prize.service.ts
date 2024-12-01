import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { PrizesRequest } from '../../models/PrizesRequest';
import { environment } from '../../../../enviroments/environment';
import { AlertService } from '../alert.service';

@Injectable({
  providedIn: 'root'
})
export class PrizeService {

  constructor(private Http:HttpClient, private alertService:AlertService, private session: SessionService) { }


  sendPrizes(request: PrizesRequest): Observable<void> {
    if (!this.session.isAuth()) {
      return new Observable<void>();
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.Http.post<void>(`${environment.apiUrl}/prizes`, request, {
      headers
    }).pipe(
      tap(() => this.alertService.successAlert('Premios enviados exitosamente')),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
  
}
