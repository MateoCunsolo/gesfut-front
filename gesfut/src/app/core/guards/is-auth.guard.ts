import { Router, type CanActivateFn } from '@angular/router';
import { SessionService } from '../services/manager/session.service';
import { inject } from '@angular/core';

export const isAuthGuard: CanActivateFn = async (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.loggingOut) return true; // Recorrido 22/10: el logout debe poder llegar a la landing
  await sessionService.ready; // Loop 7: esperar la validacion inicial del token
  const isAuthenticated = sessionService.isAuth();

  if (isAuthenticated) {
    router.navigate(['/admin']); // Redirige a la ruta deseada si ya está autenticado
    return false; // Bloquea el acceso a rutas de auth
  }

  return true; // Permite el acceso si no está autenticado
};
