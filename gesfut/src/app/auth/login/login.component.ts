import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
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
          this.redActive = true;
        }
      );
    }else{
      this.error = 'Campos inválidos';
    }
  }

  toRegister() {
    this.router.navigate(['auth/singup']);
  }




}


