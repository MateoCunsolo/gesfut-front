import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/manager/session.service';

export const adminAuthGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const isAuthenticated = sessionService.isAuth();
  const userRole = sessionService.userRole();

  if (isAuthenticated && userRole === 'MANAGER') {
    return true; 
  }

  // Recorrido 22/10: si la sesión venció, ir al login con aviso en vez de la landing.
  if (sessionService.sessionExpired) router.navigate(['/auth/login'], { queryParams: { expired: '1' } });
  else router.navigate(['/']);
  return false;
};
