import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { readResetFragment } from './reset-password/reset-token';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReciveEmailComponent } from './reset-password/recive-email.component';
import { VerifyEmailComponent } from './register/verify-email/verify-email.component';
/** Plan tokens 31-10 #3: /auth/reset-password#t=<token> abre la pantalla de nueva contrasena; sin #t= sigue el pedido de enlace. */
export function hasResetFragment(fragment: string | null | undefined): boolean {
  return !!readResetFragment(fragment);
}

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
    canMatch: [() => hasResetFragment(inject(Router).getCurrentNavigation()?.extractedUrl.fragment ?? (typeof location !== 'undefined' ? location.hash : ''))],
    component: ResetPasswordComponent
  },
  {
    path: 'reset-password',
    component: ReciveEmailComponent
  },
  {
    path: 'verify-email/:token',
    component: VerifyEmailComponent
  }
];