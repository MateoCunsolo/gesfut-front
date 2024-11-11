import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';

import { AuthResponse } from '../../models/authResponse';
import { LoginRequest } from '../../models/loginRequest';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest } from '../../models/registerRequest';
import { SessionService } from './session.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = 'http://localhost:8080/api/v1/auth';


  constructor(
    private router: Router,
    private http: HttpClient,
    private sessionService: SessionService) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.sessionService.setUserSession(response);
      }),
      map((response) => {
        const auth: AuthResponse = {
          name: response.name,
          lastName: response.lastName,
          token: response.token,
          role: response.role,
        };

        return auth;
      }),
      catchError((error: HttpErrorResponse) => {
        //this.logout();
        console.log(error);

        return throwError(() => error);
      })
    );
  }

  register(credentials: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/sing-up`, credentials).pipe(
      map((response) => {
        const auth: AuthResponse = {
          name: response.name,
          lastName: response.lastName,
          token: response.token,
          role: response.role
        }
        return auth;
      })
    )
  }
}
