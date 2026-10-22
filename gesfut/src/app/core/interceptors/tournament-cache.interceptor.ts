import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { TournamentCache } from '../services/tournament/tournament-cache';

/** Cualquier escritura exitosa (POST/PUT/PATCH/DELETE) invalida la caché de torneos para no mostrar datos viejos. */
export const tournamentCacheInterceptor: HttpInterceptorFn = (request, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next(request);
  const cache = inject(TournamentCache);
  return next(request).pipe(tap(event => { if (event instanceof HttpResponse) cache.invalidate(); }));
};
