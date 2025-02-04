import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
    selector: 'app-login',
    imports: [RouterModule, ReactiveFormsModule, SpinnerComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  redActive = false;
  protected tryLogin = false;
  protected isLoading = false;
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
          this.error = error.error.error;
          this.alertService.errorAlert(this.error);
          if (error.error.error === 'Email no verificado. Por favor, verifica tu email antes de iniciar sesión.') {
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


