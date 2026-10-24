import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/manager/auth.service';

/** 12 Verificar correo: mismo contenedor que el login; el motivo del error solo se muestra si lo informa el servidor. */
@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule],
  styleUrls: ['../../login/login.component.scss', '../../auth-extra.scss'],
  template: `
    <section>
      <div class="form">
        @if (state === 'checking') {
          <div class="result-state" role="status">
            <h1 class="title">Verificando tu correo</h1>
            <p class="intro">Esto tarda unos segundos…</p>
          </div>
        } @else if (state === 'verified') {
          <div class="result-state" role="status">
            <h1 class="title">Correo verificado</h1>
            <p class="intro">Tu cuenta ya está activa. Ingresá para empezar a organizar tus torneos.</p>
            <button type="button" class="base-button" (click)="toLogin()">Ingresar</button>
          </div>
        } @else {
          <div class="result-state" role="alert">
            <h1 class="title">No pudimos verificar tu correo</h1>
            @if (serverReason) { <p class="intro">{{ serverReason }}</p> }
            @else { <p class="intro">El enlace venció, ya se usó o está incompleto. Ingresá tu correo y te mandamos uno nuevo.</p> }
          </div>
          @if (resentTo) {
            <p class="intro" role="status">Si <strong>{{ resentTo }}</strong> tiene una cuenta sin verificar, te mandamos un enlace nuevo. Revisá también spam o correo no deseado.</p>
            <div class="secondary-actions">
              <button type="button" class="link" (click)="resentTo = ''">Enviar a otro correo</button>
              <button type="button" class="link" (click)="toLogin()">Ir a ingresar</button>
            </div>
          } @else {
          <form [formGroup]="resendForm" (ngSubmit)="resend()" novalidate>
            <label class="field-label" for="email">Correo electrónico</label>
            <div class="form-group input-icon">
              <input id="email" type="email" inputmode="email" autocomplete="email" formControlName="email" placeholder="nombre@correo.com" [attr.aria-invalid]="showEmailError" aria-describedby="email-error" />
              <i class="fas fa-envelope" aria-hidden="true"></i>
            </div>
            <div class="error-message" id="email-error" aria-live="polite">
              @if (showEmailError) { <p class="error">Ingresá un correo electrónico válido.</p> }
              @if (resendError) { <p class="error">{{ resendError }}</p> }
            </div>
            @if (sending) { <button type="button" class="base-button" disabled>Enviando…</button> }
            @else { <button type="submit" class="base-button">Reenviar enlace</button> }
            <div class="secondary-actions"><button type="button" class="link" (click)="toLogin()">Ir a ingresar</button></div>
          </form>
          }
        }
      </div>
    </section>
  `,
})
export class VerifyEmailComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  protected state: 'checking' | 'verified' | 'failed' = 'checking';
  protected serverReason = '';
  protected token = '';
  protected sending = false;
  protected resentTo = '';
  protected resendError = '';
  protected resendForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  get showEmailError(): boolean {
    const c = this.resendForm.controls.email;
    return c.invalid && c.touched;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    this.verifyEmail();
  }

  verifyEmail() {
    this.authService.verifyEmail(this.token).subscribe({
      next: () => { this.state = 'verified'; },
      error: (error) => {
        const reason = typeof error?.error?.error === 'string' ? error.error.error : '';
        // Auditoria 22/10: 'Token invalido'/'El token ha expirado' no le dicen nada al usuario: se usa el texto generico.
        this.serverReason = /token/i.test(reason) ? '' : reason;
        this.state = 'failed';
      },
    });
  }

  resend(): void {
    this.resendError = '';
    if (this.resendForm.invalid) { this.resendForm.markAllAsTouched(); return; }
    const email = String(this.resendForm.value.email).trim();
    this.sending = true;
    this.authService.resendEmail(email).subscribe({
      next: () => { this.sending = false; this.resentTo = email; },
      error: (error) => {
        this.sending = false;
        this.resendError = error?.status === 429 ? 'Probaste muchas veces. Esper\u00e1 un rato e intent\u00e1 de nuevo.' : error?.status === 0 ? 'No pudimos conectar con el servidor. Probá de nuevo.' : (error?.error?.error || 'No pudimos reenviar el enlace.');
      },
    });
  }

  toLogin() {
    this.router.navigate(['auth/login']);
  }
}
