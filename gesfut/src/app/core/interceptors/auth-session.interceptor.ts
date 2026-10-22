import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/manager/session.service';

/**
 * Si una request autenticada vuelve 401 (o 403 con el token ya vencido),
 * la sesión se limpia y se envía al login en lugar de dejar pantallas rotas.
 */
export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const authHeader = request.headers.get('Authorization');
  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const expired = !token || token === 'null' || SessionService.isTokenExpired(token);
        if (error.status === 401 || (error.status === 403 && expired)) session.expireSession();
      }
      return throwError(() => error);
    })
  );
};
