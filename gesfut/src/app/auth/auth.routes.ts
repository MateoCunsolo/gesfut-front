import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReciveEmailComponent } from './reset-password/recive-email.component';
import { VerifyEmailComponent } from './register/verify-email/verify-email.component';
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: RegisterComponent
  },
  // Alias viejo: links guardados o compartidos siguen funcionando.
  { path: 'singup', redirectTo: 'signup', pathMatch: 'full' },
  {
    path: 'reset-password',
    component: ReciveEmailComponent
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent
  },
  {
    path: 'verify-email/:token',
    component: VerifyEmailComponent
  }
];