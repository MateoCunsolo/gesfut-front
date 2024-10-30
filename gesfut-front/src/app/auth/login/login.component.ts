import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/loginRequest';
import { SessionService } from '../../core/services/session.service';
import { Router } from '@angular/router';
const materialModules = [
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatButtonModule
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ...materialModules], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;

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

  onSubmit() {
    if (this.loginForm.valid) {
      let loginRequest: LoginRequest = this.loginForm.value;
        this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.sessionService.setUserSession(response);
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

