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
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { EmailVerificationService } from '../../core/services/manager/emailVerification.service';

@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private alertService = inject(AlertService);
  private emailVerificationService = inject(EmailVerificationService);
  error: String = '';
  registerForm: FormGroup;
  protected isLoading = false;
  /** Mostrar/Ocultar contraseña. */
  showPassword = false;

  /** Validación después de interactuar: el error aparece al salir del campo o al intentar enviar. */
  showError(field: string): boolean {
    const c = this.registerForm.controls[field];
    return !!c && c.invalid && (c.touched || c.dirty && this.submitted);
  }
  private submitted = false;

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

  async onSubmit() {
    const credentials: RegisterRequest = this.registerForm.value;
    
    this.submitted = true;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
  
    this.isLoading = true;
    this.authService.register(credentials).subscribe({
      next: (response) => {
        // Loop 5: el registro ya no devuelve token (hay que verificar el email antes de entrar).
        this.alertService.successAlert('Cuenta creada. Te enviamos un mail para verificarla.');
        this.route.navigateByUrl('/auth/login?registered=1');
      },
      error: (err: HttpErrorResponse) => {
        const msg = this.authService.errorMessage(err, 'revisá los datos e intentá de nuevo.');
        this.alertService.errorAlert(err?.status === 0 ? msg : 'No pudimos crear la cuenta: ' + msg);
        this.isLoading = false;
      },
    });
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
