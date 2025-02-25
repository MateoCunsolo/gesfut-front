import { Router, type CanActivateFn } from '@angular/router';
import { SessionService } from '../services/manager/session.service';
import { inject } from '@angular/core';

export const isAuthGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const isAuthenticated = sessionService.isAuth();
  const token = sessionStorage.getItem('token');
  if (isAuthenticated || token) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};
