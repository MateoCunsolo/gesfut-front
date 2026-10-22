import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-recive-email',
    imports: [ReactiveFormsModule],
    template: `
  <section>
    <div class="form">
      @if (sentTo) {
        <div class="result-state" role="status">
          <h1 class="title">Revisá tu correo</h1>
          <p class="intro">Si <strong>{{ sentTo }}</strong> tiene una cuenta en Gesfut, te enviamos un enlace para crear una nueva contraseña. Puede tardar unos minutos; revisá también spam o correo no deseado.</p>
          <button type="button" class="base-button" (click)="toLogin()">Volver a ingresar</button>
          <div class="secondary-actions">
            <button type="button" class="link" (click)="retry()">¿No llegó? Enviar de nuevo</button>
          </div>
        </div>
      } @else {
      <form [formGroup]="emailForm" (ngSubmit)="onSubmit()" novalidate>
        <h1 class="title">Recuperar contraseña</h1>
        <p class="intro">Ingresá el correo de tu cuenta y te enviamos un enlace para crear una nueva contraseña.</p>
        <label class="field-label" for="email">Correo electrónico</label>
        <div class="form-group input-icon">
          <input id="email" type="email" inputmode="email" autocomplete="email" formControlName="email" placeholder="nombre@correo.com" [attr.aria-invalid]="showError" aria-describedby="email-error" />
          <i class="fas fa-envelope" aria-hidden="true"></i>
        </div>
        <div class="error-message" id="email-error" aria-live="polite">
          @if (showError) {
            @if (emailForm.controls['email'].getError('required')) { <p class="error">Ingresá tu correo electrónico.</p> }
            @else { <p class="error">Ingresá un correo electrónico válido.</p> }
          }
          @if (sendError) { <p class="error">{{ sendError }}</p> }
        </div>
        @if (sending) {
          <button type="button" class="base-button" disabled>Enviando…</button>
        } @else {
          <button type="submit" class="base-button">Enviar enlace</button>
        }
        <div class="secondary-actions">
          <button type="button" class="link" (click)="toLogin()">¿Te acordaste? Ingresar</button>
        </div>
      </form>
      }
    </div>
  </section>
    `,
    styleUrls: ['../login/login.component.scss', '../auth-extra.scss']
})
export class ReciveEmailComponent {
  emailForm: FormGroup;
  error: string = '';
  redActive = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /** Estado tras enviar: próximo paso + reintento. */
  sentTo = '';
  sending = false;
  sendError = '';

  get showError(): boolean {
    const c = this.emailForm.controls['email'];
    return c.invalid && c.touched;
  }

  onSubmit() {
    this.sendError = '';
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = String(this.emailForm.value.email).trim();
    this.sending = true;
    this.authService.resetPasswordSendEmail(email).subscribe({
      next: () => { this.sending = false; this.sentTo = email; },
      error: (err) => {
        this.sending = false;
        this.sendError = err?.status === 0
          ? 'No pudimos conectar con el servidor. Probá de nuevo en un momento.'
          : (err?.error?.error || 'No pudimos enviar el enlace. Revisá el correo e intentá de nuevo.');
      },
    });
  }

  retry() {
    this.sentTo = '';
    this.sendError = '';
  }

  toLogin() {
    this.router.navigate(['auth/login']);
  }
}
