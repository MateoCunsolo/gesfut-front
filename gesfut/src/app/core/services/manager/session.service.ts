import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse } from '../../models/authResponse';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentUserData: BehaviorSubject<AuthResponse> = new BehaviorSubject<AuthResponse>({
    name: '',
    lastName: '',
    token: '',
    role: ''
  });

  constructor(private router:Router) {
    this.initializeSession();
  }

  private initializeSession(): void {
      const token = sessionStorage.getItem('token');
      this.currentUserLoginOn.next(token != null);
      this.currentUserData.next({
        name: sessionStorage.getItem('name') || '',
        lastName: sessionStorage.getItem('lastName') || '',
        token: sessionStorage.getItem('token') || '',
        role: sessionStorage.getItem('role') || ''
      });
  }

  setUserSession(response: AuthResponse): void {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('name', response.name);
      sessionStorage.setItem('lastName', response.lastName);
      sessionStorage.setItem('role', response.role);
      this.currentUserData.next(response);
      this.currentUserLoginOn.next(true);
  }

  clearUserSession(): void {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('name');
      sessionStorage.removeItem('lastName');
      sessionStorage.removeItem('role');
      this.currentUserLoginOn.next(false);
      this.currentUserData.next({
        name: '',
        lastName: '',
        token: '',
        role: ''
      });
      window.location.reload();
      this.router.navigateByUrl("/home");
  }

  get userData(): Observable<AuthResponse> {
    return this.currentUserData.asObservable();
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  isAuth(): boolean {
    return this.currentUserLoginOn.value;
  }

  userRole(): string{
    const userdata = this.currentUserData.getValue();
    return userdata.role;
  }

  token(): string{
    const userdata = this.currentUserData.getValue();
    return userdata.token;
  }
}
