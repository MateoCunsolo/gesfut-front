import { Router, type CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';
import { inject } from '@angular/core';

export const isAuthGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const isAuthenticated = sessionService.isAuth();

  if (isAuthenticated) {
    router.navigate(['/admin']); // Redirige a la ruta deseada si ya está autenticado
    return false; // Bloquea el acceso a rutas de auth
  }

  return true; // Permite el acceso si no está autenticado
};
