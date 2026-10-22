import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { PwaService } from '../services/pwa.service';
import { environment } from '../../../enviroments/environment';

export const pwaConnectionInterceptor: HttpInterceptorFn = (request, next) => {
  const pwa = inject(PwaService);
  const apiBase = new URL(environment.apiUrl, 'http://localhost').href.replace(/\/$/, '');
  const requestUrl = new URL(request.url, 'http://localhost').href;
  if (requestUrl !== apiBase && !requestUrl.startsWith(apiBase + '/')) return next(request);
  if (!pwa.online()) {
    return throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Sin conexión', error: {
      error: ['GET', 'HEAD', 'OPTIONS'].includes(request.method)
        ? 'No hay conexión para consultar los datos actuales. Volvé a conectarte e intentá nuevamente.'
        : 'Sin conexión. Tus cambios no se guardaron. Volvé a conectarte e intentá nuevamente.'
    } }));
  }
  return next(request).pipe(
    tap(() => pwa.serverUnavailable.set(false)),
    catchError(error => {
      if (error instanceof HttpErrorResponse && [0, 502, 503, 504].includes(error.status)) pwa.serverUnavailable.set(true);
      return throwError(() => error);
    })
  );
};
