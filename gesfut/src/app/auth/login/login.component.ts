import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { isRegisteredNotice, resendMessage, RESEND_TOO_MANY, REGISTERED_NOTICE, SHOW_RESEND_AFTER_REGISTER } from '../auth-messages';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
    selector: 'app-login',
    imports: [RouterModule, ReactiveFormsModule, SpinnerComponent],
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
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe(
        (response) => {
          this.sessionService.setUserSession(response);
          this.dashboardService.setActiveDashboardAdminComponent('dashboard');
          this.router.navigate(['/admin']);
        },
        (error) => {
          const fallback = error?.status === 401 || error?.status === 403 ? 'Mail o contraseña incorrectos.' : 'No pudimos iniciar sesión. Probá de nuevo.';
          this.error = this.authService.errorMessage(error, fallback);
          this.alertService.errorAlert(this.error);
          if (typeof error?.error?.error === 'string' && error.error.error.startsWith('Email no verificado')) {
            this.showResend = true;
          }
          this.redActive = true;
          this.tryLogin = true;
          this.isLoading = false;
        }
      );
    }else{
      // this.error = 'Campos inválidos';
      this.alertService.errorAlert('Formulario inválido');
    }
  }

  sendVerification() {
    if (this.resendCooldown > 0) return;
    const email = String(this.loginForm.value.email || '').trim();
    if (!email || this.loginForm.controls['email'].invalid) { this.alertService.errorAlert('Escrib\u00ed tu mail arriba para reenviarte el enlace.'); return; }
    this.startResendCooldown(60);
    this.authService.resendEmail(email).subscribe({
      next: (r: any) => this.alertService.successAlert(resendMessage(r)),
      error: (err) => this.alertService.errorAlert(err?.status === 429 ? RESEND_TOO_MANY : this.authService.errorMessage(err, 'No pudimos reenviar el mail. Prob\u00e1 de nuevo en un rato.'))
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
    this.alertService.confirmAlert("Verificacion de correo", "Deseas recibir nuevamente el correo de verificación?", 'Reenviar').then((result) => {
      if (result.isConfirmed) {
        this.alertService.loadingAlert('Reenviando correo de verificación...');
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


