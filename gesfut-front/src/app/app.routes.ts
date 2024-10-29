import { Routes } from '@angular/router';
import { LandingComponent } from './guest/landing/landing.component';

export const routes: Routes = [
    //path: '', loadChildren : () => import('./admin/admin.routes').then(m =>m.admin_ROUTES)

    
    {
        path: 'auth', loadChildren : () => import('./auth/auth.routes').then(m =>m.AUTH_ROUTES)
    }
];
