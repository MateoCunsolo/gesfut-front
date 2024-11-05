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

  router.navigate(['/']);
  return false;
};
