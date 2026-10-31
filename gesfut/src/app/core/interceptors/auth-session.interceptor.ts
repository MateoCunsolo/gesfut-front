import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { SessionService, SKIP_SESSION_CHECK } from '../services/manager/session.service';

/** Una sola consulta a /validate-token a la vez, aunque fallen varias requests juntas. */
let pendingCheck: Observable<boolean> | null = null;

function checkSession(session: SessionService): Observable<boolean> {
  if (!pendingCheck) {
    const token = sessionStorage.getItem('token') || '';
    pendingCheck = session.validateToken(token).pipe(
      map(valid => valid === true),
      // Solo un 401/403 de /validate-token confirma la sesion invalida; sin red o 5xx no se desloguea.
      catchError((e: unknown) => of(!(e instanceof HttpErrorResponse && (e.status === 401 || e.status === 403)))),
      finalize(() => { pendingCheck = null; }),
      shareReplay(1)
    );
  }
  return pendingCheck;
}

/**
 * Si una request autenticada vuelve 401 (o 403 con la sesion ya vencida):
 * - con sessionExp vencido se cierra la sesion sin llamar a la red;
 * - si no, se pregunta una vez a /validate-token y solo se cierra la sesion si responde false.
 * Un 401 suelto de un endpoint con la sesion todavia valida ya no desloguea.
 */
export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_SESSION_CHECK)) return next(request);
  const session = inject(SessionService);
  const authHeader = request.headers.get('Authorization');
  return next(request).pipe(
    catchError(error => {
      if (!(error instanceof HttpErrorResponse) || !authHeader?.startsWith('Bearer ')) return throwError(() => error);
      const token = authHeader.substring(7);
      const expired = !token || token === 'null' || SessionService.isTokenExpired(token);
      if (error.status !== 401 && !(error.status === 403 && expired)) return throwError(() => error);
      if (expired) {
        session.expireSession();
        return throwError(() => error);
      }
      return checkSession(session).pipe(
        switchMap(valid => {
          if (!valid) session.expireSession();
          return throwError(() => error);
        })
      );
    })
  );
};
