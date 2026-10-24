import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse } from '../../models/authResponse';
import { Router } from '@angular/router';
import {  map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/environment';
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

  url: string = environment.apiUrl+'/auth';
  /** Recorrido 22/10: true mientras se cierra sesión, para que isAuthGuard deje pasar a la landing. */
  loggingOut = false;
  /** Recorrido 22/10: la sesión se descartó por vencida o inválida (no por logout). */
  sessionExpired = false;
  /** Loop 7: se resuelve cuando termina la validacion inicial del token; los guards la esperan (antes, con assets en cache, el guard corria antes y expulsaba a la landing). */
  private markReady!: () => void;
  readonly ready: Promise<void> = new Promise<void>(resolve => this.markReady = resolve);


  constructor(private router:Router, private http: HttpClient) {
    this.initializeSession();
  }

  private initializeSession(): void {
    const token = sessionStorage.getItem('token');
    if(token != null){
      if (SessionService.isTokenExpired(token)) {
        this.removeStoredSession();
        this.markReady();
        return;
      }
      this.verificateSession(token);
      return;
    }
    this.markReady();
}

verificateSession(token:string) {
  this.validateToken(token).subscribe({
    next: (response) => {
      if(response){
        this.getItems(response);
      }else{
        this.removeStoredSession();
      }
      this.markReady();
    },
    error: () => { this.removeStoredSession(); this.markReady(); }
  });
}

getItems(response:boolean) {
  this.currentUserLoginOn.next(response)
  this.currentUserData.next({
    name: sessionStorage.getItem('name') || '',
    lastName: sessionStorage.getItem('lastName') || '',
    token: sessionStorage.getItem('token') || '',
    role: sessionStorage.getItem('role') || ''
  });
}

  /** Plan #13: el JWT vive en la cookie httpOnly; aca solo queda un marcador y el vencimiento (24 h). */
  static readonly COOKIE_MARKER = 'cookie';

  setUserSession(response: AuthResponse): void {
      sessionStorage.setItem('token', SessionService.COOKIE_MARKER);
      sessionStorage.setItem('sessionExp', String(Date.now() + 24 * 60 * 60 * 1000));
      response = { ...response, token: SessionService.COOKIE_MARKER };
      sessionStorage.setItem('name', response.name);
      sessionStorage.setItem('lastName', response.lastName);
      sessionStorage.setItem('role', response.role);
      this.currentUserData.next(response);
      this.currentUserLoginOn.next(true);
  }

  clearUserSession(): void {
      // C(a): el acceso directo "Retomar último torneo" no debe sobrevivir al cierre de sesión (otro usuario en el mismo navegador).
      localStorage.removeItem('lastTournamentClicked');
      localStorage.removeItem('lastTournamentClickedName');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('sessionExp');
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
      this.router.navigate(['/login']);
  }

  get userData(): Observable<AuthResponse> {
    return this.currentUserData.asObservable();
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  isAuth(): boolean {
    if (!this.currentUserLoginOn.value) return false;
    const token = sessionStorage.getItem('token');
    if (!token || SessionService.isTokenExpired(token)) {
      this.expireSession();
      return false;
    }
    return true;
  }

  /** Sesión vencida o rechazada por el servidor: limpia y envía al login sin recargar la app. */
  expireSession(): void {
    this.removeStoredSession();
    this.router.navigate(['/auth/login']);
  }

  private removeStoredSession(): void {
    if (sessionStorage.getItem('token')) this.sessionExpired = true;
    ['token', 'sessionExp', 'name', 'lastName', 'role'].forEach(key => sessionStorage.removeItem(key));
    this.currentUserLoginOn.next(false);
    this.currentUserData.next({ name: '', lastName: '', token: '', role: '' });
  }

  /** Lee el claim exp del JWT (sin validar firma: eso lo hace el backend). */
  static isTokenExpired(token: string): boolean {
    if (token === SessionService.COOKIE_MARKER) {
      const exp = Number(sessionStorage.getItem('sessionExp') || 0);
      return !exp || exp <= Date.now();
    }
    try {
      const payload = token.split('.')[1];
      if (!payload) return true;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')));
      return typeof json.exp === 'number' ? json.exp * 1000 <= Date.now() : false;
    } catch {
      return true;
    }
  }

  userRole(): string{
    const userdata = this.currentUserData.getValue();
    return userdata.role;
  }

  token(): string{
    const userdata = this.currentUserData.getValue();
    return userdata.token;
  }

  /** Loop 5: revoca el token en el servidor. Si falla (sin red, ya vencido) igual se limpia la sesion local. */
  revokeToken(): Promise<void> {
    const token = sessionStorage.getItem('token');
    if (!token) return Promise.resolve();
    return new Promise(resolve => {
      this.http.post(`${this.url}/logout`, null, { headers: { Authorization: `Bearer ${token}` } })
        .subscribe({ next: () => resolve(), error: () => resolve() });
    });
  }

  validateToken(token:string): Observable<boolean> {
    // Loop 4: el token va en el header, nunca en la URL.
    return this.http.post<boolean>(`${this.url}/validate-token`, null, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
  }


}
