import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { isRegisteredNotice } from '../auth-messages';
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
  /** Recorrido 22/10: aviso cuando se llega por sesión vencida. */
  /** Despues de crear la cuenta: recordar verificar el mail antes de entrar. */
  protected registeredNotice = typeof location !== 'undefined' && isRegisteredNotice(location.search);
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
            setTimeout(() => {
              this.resendEmail();
            }, 2000);
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

  toRegister() {
    this.router.navigate(['auth/singup']);
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


