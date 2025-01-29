import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/manager/auth.service';
import { RegisterRequest } from '../../core/models/registerRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private alertService = inject(AlertService);

  error: String = '';
  registerForm: FormGroup;

  private emailValidator(control: { value: string }) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: Router
  ) {
    this.registerForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, this.emailValidator.bind(this)]], // <-- Cambio aquí
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    const credentials: RegisterRequest = this.registerForm.value;
    if (this.registerForm.invalid) {
      this.alertService.errorAlert('Formulario inválido');
    } else {
      this.authService.register(credentials).subscribe({
        next: (response) => {
          if (response.token){
            this.alertService.successAlert('Usuario registrado correctamente');
            this.route.navigateByUrl('/auth/login');
          }else{
            this.alertService.errorAlert('Error al registrar usuario');
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.error = err.error.error;
        },
      });
    }
  }

  validate(field: string, error: string): void {
    return (
      this.registerForm.controls[field].getError(error) &&
      this.registerForm.controls[field].touched
    );
  }

  toLogin() {
    this.route.navigate(['auth/login']);
  }
}
