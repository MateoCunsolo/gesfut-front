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
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { RegisterRequest } from '../../models/registerRequest';
import { SessionService } from './session.service';
import { Token } from '@angular/compiler';
import { AlertService } from '../alert.service';
import { environment } from '../../../../enviroments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = environment.apiUrl+'/auth';


  constructor(
    private router: Router,
    private http: HttpClient,
    private sessionService: SessionService,
    private alertService: AlertService
  ) { }

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

  resetPasswordSendEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.url}/reset-password/${email}`, {}); 
  }

  resetPasswordSendNewPassword(password: string, token: string): Observable<void> {
    return this.http.post<void>(`${this.url}/change-password/${token}`, password);
  }   

  changePasswordWithOldPassword(oldPassword: string, newPassword: string): Observable<void> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }
    const passwords = { oldPassword, newPassword }; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<void>(`${this.url}/change-password-with-old-password`, passwords, { headers });
  }
  
  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.url}/verify-email/${token}`,{});
  }

  resendEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.url}/resend-verification/${email}`, {});
  }

  serverNotResponding(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.alertService.errorAlert('Error al conectar con el servidor. Intentelo más tarde.');
    }
  }


}
  
