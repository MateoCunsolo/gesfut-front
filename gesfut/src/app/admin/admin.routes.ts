import { Routes } from '@angular/router';
import { tournamentExistsGuard } from '../core/guards/tournamentExists.guard';
import { AdminPageComponent } from '../pages/admin-page/admin-page.component';
import { AdminTournamentPageComponent } from '../pages/admin-tournament-page/admin-tournament-page.component';
import { ResetPasswordComponent } from '../auth/reset-password/reset-password.component';
import { FaqComponent } from './faq/faq.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminPageComponent
  },
  {
    path: 'tournaments/:code',
    component: AdminTournamentPageComponent
    /* canActivate: [tournamentExistsGuard] */
  },
  {
    path: 'change-password',
    component: ResetPasswordComponent
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  {
    path: '**',
    redirectTo: '',
  },
];
