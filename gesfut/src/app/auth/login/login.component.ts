import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/loginRequest';
import { SessionService } from '../../core/services/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  error:String= '';
  hide = signal(true);


  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private sessionService:SessionService,
    private router:Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      let loginRequest: LoginRequest = this.loginForm.value;
        this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.sessionService.setUserSession(response);
          this.router.navigateByUrl('/admin')
        },
        error: (err) => {
        },
        complete: () => {
          console.log('Login request completed');
        },
      });
    }
  }
}

