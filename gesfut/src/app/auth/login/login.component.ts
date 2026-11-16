import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { isRegisteredNotice, resendMessage, resendTooManyMessage, retryAfterFromError, REGISTERED_NOTICE, SHOW_RESEND_AFTER_REGISTER, LOGIN_BAD_CREDENTIALS, LOGIN_EMAIL_INVALID, LOGIN_EMAIL_REQUIRED, LOGIN_PASSWORD_REQUIRED, NETWORK_ERROR, SERVER_ERROR, SESSION_EXPIRED, TOO_MANY_ATTEMPTS } from '../auth-messages';

@Component({
    selector: 'app-login',
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  /** Mostrar/Ocultar contraseña (visible, sin depender de un intento fallido). */
  showPassword = false;
  loginForm: FormGroup;
  error: string = '';
  redActive = false;
  protected tryLogin = false;
  protected isLoading = false;
  /** Tras crear la cuenta: aviso "Cuenta creada" (sin mail de verificacion mientras SHOW_RESEND_AFTER_REGISTER sea false). */
  protected registeredNotice = typeof location !== 'undefined' && isRegisteredNotice(location.search);
  /** Reenviar mail de verificacion: visible tras crear cuenta o si el login dice "Email no verificado". */
  protected showResend: boolean = this.registeredNotice && SHOW_RESEND_AFTER_REGISTER;
  protected readonly registeredNoticeText = REGISTERED_NOTICE;
  protected resendCooldown = 0;
  private resendTimer: ReturnType<typeof setInterval> | null = null;
  /** Recorrido 22/10: aviso cuando se llega por sesión vencida. */
  protected expiredNotice = typeof location !== 'undefined' && new URLSearchParams(location.search).get('expired') === '1';
  private submitted = false;
  readonly LOGIN_BAD_CREDENTIALS = LOGIN_BAD_CREDENTIALS;
  readonly LOGIN_EMAIL_INVALID = LOGIN_EMAIL_INVALID;
  readonly LOGIN_EMAIL_REQUIRED = LOGIN_EMAIL_REQUIRED;
  readonly LOGIN_PASSWORD_REQUIRED = LOGIN_PASSWORD_REQUIRED;
  readonly SESSION_EXPIRED = SESSION_EXPIRED;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private router: Router
  ) {
    // Plan tokens 31-10 #6: si el interceptor cerro la sesion, mostrar el aviso aunque la URL todavia no tenga ?expired=1.
    if (this.sessionService.sessionExpired) this.expiredNotice = true;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  showError(field: string): boolean {
    const c = this.loginForm.controls[field];
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid) {
      const first = this.showError('email') ? 'email' : (this.showError('password') ? 'password' : '');
      if (first) document.getElementById(first)?.focus();
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe(
      (response) => {
        this.sessionService.setUserSession(response);
        this.dashboardService.setActiveDashboardAdminComponent('dashboard');
        this.router.navigate(['/admin']);
      },
      (error) => {
        if (!error || error.status === 0) {
          this.error = NETWORK_ERROR;
        } else if (error.status >= 500) {
          this.error = SERVER_ERROR;
        } else if (error.status === 429) {
          this.error = TOO_MANY_ATTEMPTS;
        } else if (error.status === 401 || error.status === 403) {
          const raw = typeof error?.error?.error === 'string' ? error.error.error : '';
          if (raw.startsWith('Email no verificado')) {
            this.error = this.authService.errorMessage(error, LOGIN_BAD_CREDENTIALS);
            this.showResend = true;
          } else {
            this.error = LOGIN_BAD_CREDENTIALS;
            this.loginForm.get('password')?.setValue('');
            setTimeout(() => document.getElementById('password')?.focus(), 0);
          }
        } else {
          this.error = this.authService.errorMessage(error, 'No pudimos iniciar sesión. Probá de nuevo.');
        }
        this.redActive = true;
        this.tryLogin = true;
        this.isLoading = false;
      }
    );
  }

  sendVerification() {
    if (this.resendCooldown > 0) return;
    const email = String(this.loginForm.value.email || '').trim();
    if (!email || this.loginForm.controls['email'].invalid) { this.alertService.errorAlert('Escrib\u00ed tu mail arriba para reenviarte el enlace.'); return; }
    this.startResendCooldown(60);
    this.authService.resendEmail(email).subscribe({
      next: (r: any) => this.alertService.successAlert(resendMessage(r)),
      error: (err) => this.alertService.errorAlert(err?.status === 429 ? resendTooManyMessage(retryAfterFromError(err)) : this.authService.errorMessage(err, 'No pudimos reenviar el mail. Prob\u00e1 de nuevo en un rato.'))
    });
  }

  private startResendCooldown(seconds: number) {
    this.resendCooldown = seconds;
    if (this.resendTimer) clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown = Math.max(0, this.resendCooldown - 1);
      if (this.resendCooldown === 0 && this.resendTimer) { clearInterval(this.resendTimer); this.resendTimer = null; }
    }, 1000);
  }

  toRegister() {
    this.router.navigate(['auth/signup']);
  }


  toForgotPassword() {
    this.router.navigate(['auth/reset-password']);
  }

  resendEmail() {
    this.alertService.confirmAlert("Verificacion de correo", "Deseas recibir nuevamente el correo de verificaci\u00f3n?", 'Reenviar').then((result) => {
      if (result.isConfirmed) {
        this.alertService.loadingAlert('Reenviando correo de verificaci\u00f3n...');
        this.authService.resendEmail(this.loginForm.value.email).subscribe(
          (response) => {
            this.alertService.successAlert('Correo reenviado');
          },
          (error) => {
            this.alertService.errorAlert('Error al reenviar el correo');
          }
        );
      }
    });
  }

}
