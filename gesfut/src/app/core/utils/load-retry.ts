import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, retry, throwError, timer } from 'rxjs';

export type LoadErrorKind = 'not-found' | 'offline';

/** 400/404/409: el código no es válido o el torneo no existe. Reintentar no sirve. */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && [400, 404, 409].includes(error.status);
}

export function loadErrorKind(error: unknown): LoadErrorKind {
  return isNotFoundError(error) ? 'not-found' : 'offline';
}

/** Errores transitorios: sin conexión (0) o servidor/proxy no disponible (502/503/504). Un 500 no se reintenta. */
export function isTransientError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && [0, 502, 503, 504].includes(error.status);
}

/** Reintenta automáticamente solo errores transitorios con backoff 2 s, 4 s, 8 s. */
export function retryTransient<T>(delaysMs: number[] = [2000, 4000, 8000]): MonoTypeOperatorFunction<T> {
  return retry({
    count: delaysMs.length,
    delay: (error, retryCount) => !isTransientError(error) ? throwError(() => error) : timer(delaysMs[retryCount - 1])
  });
}
