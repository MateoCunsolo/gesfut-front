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
import {
  NETWORK_ERROR,
  REGISTERED_ALERT,
  SERVER_ERROR,
  SIGNUP_EMAIL_INVALID,
  SIGNUP_EMAIL_TAKEN,
  SIGNUP_GENERIC_CONFLICT,
  SIGNUP_LAST_NAME_REQUIRED,
  SIGNUP_NAME_REQUIRED,
  SIGNUP_PASSWORD_SHORT,
  SIGNUP_TERMS,
  TOO_MANY_ATTEMPTS,
} from '../auth-messages';

@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private alertService = inject(AlertService);
  error: String = '';
  registerForm: FormGroup;
  protected isLoading = false;
  /** Mostrar/Ocultar contraseña. */
  showPassword = false;
  formAlert = '';
  emailTaken = false;
  fieldServerError: Record<string, string> = {};
  readonly NETWORK_ERROR = NETWORK_ERROR;
  readonly SIGNUP_EMAIL_INVALID = SIGNUP_EMAIL_INVALID;
  readonly SIGNUP_EMAIL_TAKEN = SIGNUP_EMAIL_TAKEN;
  readonly SIGNUP_LAST_NAME_REQUIRED = SIGNUP_LAST_NAME_REQUIRED;
  readonly SIGNUP_NAME_REQUIRED = SIGNUP_NAME_REQUIRED;
  readonly SIGNUP_PASSWORD_SHORT = SIGNUP_PASSWORD_SHORT;
  readonly SIGNUP_TERMS = SIGNUP_TERMS;

  /** Validación después de interactuar: el error aparece al salir del campo, al enviar, o al escribir la contraseña. */
  showError(field: string): boolean {
    const c = this.registerForm.controls[field];
    if (!c || !c.invalid) return false;
    if (field === 'password' && c.dirty) return true;
    return c.touched || this.submitted;
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
      email: ['', [Validators.required, this.emailValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      // Tema 7: aceptar Terminos y Privacidad es obligatorio para crear la cuenta.
      acceptedTerms: [false, Validators.requiredTrue],
    });
  }

  async onSubmit() {
    this.submitted = true;
    this.formAlert = '';
    this.emailTaken = false;
    this.fieldServerError = {};
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      this.focusFirstError();
      return;
    }
    if (this.isLoading) return;

    const credentials: RegisterRequest = {
      ...this.registerForm.value,
      name: String(this.registerForm.value.name ?? '').trim().replace(/\s+/g, ' '),
      lastName: String(this.registerForm.value.lastName ?? '').trim().replace(/\s+/g, ' '),
      acceptedTerms: true,
    };

    this.isLoading = true;
    this.authService.register(credentials).subscribe({
      next: (response) => {
        // Loop 5: el registro ya no devuelve token (hay que verificar el email antes de entrar).
        this.alertService.successAlert(REGISTERED_ALERT);
        this.route.navigateByUrl('/auth/login?registered=1');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.applySignupError(err);
        this.focusFirstError();
      },
    });
  }

  retrySubmit() {
    this.onSubmit();
  }

  private applySignupError(err: HttpErrorResponse | any) {
    if (!err || err.status === 0) { this.formAlert = NETWORK_ERROR; return; }
    if (err.status >= 500) { this.formAlert = SERVER_ERROR; return; }
    if (err.status === 429) { this.formAlert = TOO_MANY_ATTEMPTS; return; }
    if (err.status === 409) {
      const msg = this.authService.errorMessage(err, SIGNUP_GENERIC_CONFLICT);
      if (/email|correo|ya existe/i.test(msg)) {
        this.emailTaken = true;
        this.fieldServerError['email'] = SIGNUP_EMAIL_TAKEN;
      } else {
        this.formAlert = SIGNUP_GENERIC_CONFLICT;
      }
      return;
    }
    const errors = err?.error?.errors;
    if (errors && typeof errors === 'object') {
      for (const [k, v] of Object.entries(errors)) {
        if (typeof v === 'string' && v.trim()) this.fieldServerError[k] = v;
      }
    }
    if (Object.keys(this.fieldServerError).length) return;
    const msg = this.authService.errorMessage(err, 'Revisá los datos e intentá de nuevo.');
    if (/contrase/i.test(msg)) this.fieldServerError['password'] = SIGNUP_PASSWORD_SHORT;
    else if (/apellido/i.test(msg)) this.fieldServerError['lastName'] = msg;
    else if (/correo|email/i.test(msg)) this.fieldServerError['email'] = msg;
    else if (/nombre/i.test(msg)) this.fieldServerError['name'] = msg;
    else this.formAlert = msg;
  }

  private focusFirstError() {
    const order = ['name', 'lastName', 'email', 'password', 'acceptedTerms'];
    const first = order.find((f) => this.showError(f) || this.fieldServerError[f]);
    const id = first === 'acceptedTerms' ? 'acceptedTerms' : first;
    if (!id) {
      if (this.formAlert) document.getElementById('signup-form-alert')?.focus();
      return;
    }
    const el = document.getElementById(id);
    if (el && 'focus' in el) (el as HTMLElement).focus();
  }

  /** Tema 7: sin tildar no se puede enviar (ni con el boton ni con Enter). */
  get termsAccepted(): boolean {
    return this.registerForm.controls['acceptedTerms'].value === true;
  }

  showPasswordHelp(): boolean {
    return !(this.showError('password') && this.registerForm.controls['password'].getError('minlength'));
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

  toForgotPassword() {
    this.route.navigate(['auth/reset-password']);
  }
}
