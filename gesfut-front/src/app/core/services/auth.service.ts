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
import { AuthResponse } from '../models/authResponse';
import { LoginRequest } from '../models/loginRequest';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest } from '../models/registerRequest';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = 'http://localhost:8080/api/v1/auth';

  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  currentUserData: BehaviorSubject<AuthResponse> =
    new BehaviorSubject<AuthResponse>({
      firstName: '',
      lastName: '',
      token: '',
      role: '',
    });

  constructor(private router: Router, private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        //this.sessionService.setUserSession(response);
        this.currentUserLoginOn.next(true);
        this.currentUserData.next(response);
      }),
      map((response) => {
        const auth: AuthResponse = {
          firstName: response.firstName,
          lastName: response.lastName,
          token: response.token,
          role: response.role,
        };

        return auth;
      }),
      catchError((error: HttpErrorResponse) => {
        //this.logout();
        return throwError(() => error);
      })
    );
  }

  register(credentials:RegisterRequest):Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.url}/sing-up`, credentials).pipe(
      tap((response:AuthResponse) => {
        //this.sessionService.setUserSession(response);
        this.currentUserLoginOn.next(true);
        this.currentUserData.next(response);
      }),
      map((response)=>{
        const auth : AuthResponse = {
          firstName: response.firstName,
          lastName: response.lastName,
          token: response.token,
          role: response.role
        }
        return auth;
      })
    )
  }
}
