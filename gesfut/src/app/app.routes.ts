import { Routes} from '@angular/router';

import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { isAuthGuard } from './core/guards/is-auth.guard';

import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
    {
        path: '', loadComponent: () => import('./guest/landing/landing.component').then(m => m.LandingComponent),
        canActivate: [isAuthGuard]
    },
    {
        path: 'auth', loadChildren : () => import('./auth/auth.routes').then(m =>m.AUTH_ROUTES),
        canActivate: [isAuthGuard]
    },
    {
        path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [adminAuthGuard]
    },
    {
      path: ':code', loadComponent: () => import('./pages/public-page/public-page.component').then(m => m.PublicPageComponent)
    }
   
];
