import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TournamentService } from '../services/tournament/tournament.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const tournamentExistsGuard: CanActivateFn = (route, state) => {
  
  const tournamentService = inject(TournamentService);
  const router = inject(Router);

  // Extrae el código del torneo desde la URL
  const tournamentId = route.paramMap.get('code'); // 'id' es el nombre del parámetro en la ruta

  if (!tournamentId) {
    // Si no hay ID en la URL, redirige a una página de error o inicio
    router.navigate(['']); 
    return of(false);
  }

  // Llama al servicio para verificar si el torneo existe
  return tournamentService.tournamentExists(tournamentId).pipe(
    map((exists: boolean) => {
      if (exists) {
        return true;
      } else {
        // Si no existe, redirige a una página de error o inicio
        router.navigate(['']);
        return false;
      }
    }),
    catchError(() => {
      // En caso de error, redirige a una página de error o inicio
      router.navigate(['']);
      return of(false);
    })
  );
};
