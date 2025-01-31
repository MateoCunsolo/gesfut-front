import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  redActive = false;
  protected tryLogin = false;
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
      this.authService.login(this.loginForm.value).subscribe(
        (response) => {
          this.sessionService.setUserSession(response);
          this.dashboardService.setActiveDashboardAdminComponent('dashboard');
          this.router.navigate(['/admin']);
        },
        (error) => {
          this.error = error.error.error;
          this.alertService.errorAlert(this.error);
          this.redActive = true;
          this.tryLogin = true;
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

}


