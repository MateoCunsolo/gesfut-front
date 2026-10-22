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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password2',
  imports: [ReactiveFormsModule],
  styleUrls: ['../login/login.component.scss', '../auth-extra.scss'],
  template: `
    <section>
      <div class="form">
        @if (linkState === 'checking') {
          <div class="result-state" role="status"><h1 class="title">{{ isFromSession ? 'Cambiar contraseña' : 'Nueva contraseña' }}</h1><p class="intro">Comprobando el enlace…</p></div>
        } @else if (linkState === 'invalid') {
          <div class="result-state" role="alert">
            <h1 class="title">El enlace no es válido</h1>
            <p class="intro">Puede que esté incompleto, que ya se haya usado o que haya vencido. Pedí uno nuevo para crear tu contraseña.</p>
            <button type="button" class="base-button" (click)="toRequestLink()">Pedir un enlace nuevo</button>
            <div class="secondary-actions"><button type="button" class="link" (click)="toLogin()">Volver a ingresar</button></div>
          </div>
        } @else if (linkState === 'error') {
          <div class="result-state" role="alert">
            <h1 class="title">No pudimos comprobar el enlace</h1>
            <p class="intro">Revisá tu conexión e intentá de nuevo.</p>
            <button type="button" class="base-button" (click)="retryCheck()">Reintentar</button>
            <div class="secondary-actions"><button type="button" class="link" (click)="isFromSession ? back() : toLogin()">{{ isFromSession ? 'Volver al panel' : 'Volver a ingresar' }}</button></div>
          </div>
        } @else if (linkState === 'done') {
          <div class="result-state" role="status">
            <h1 class="title">Contraseña guardada</h1>
            <p class="intro">Ya podés ingresar con tu nueva contraseña.</p>
            <button type="button" class="base-button" (click)="toLogin()">Ingresar</button>
          </div>
        } @else {
        <form [formGroup]="resetPassForm" (ngSubmit)="onSubmit()" novalidate>
          <h1 class="title">{{ isFromSession ? 'Cambiar contraseña' : 'Nueva contraseña' }}</h1>
          <p class="intro">{{ isFromSession ? 'Ingresá tu contraseña actual y elegí una nueva.' : 'Elegí una nueva contraseña para tu cuenta.' }}</p>

          @if (isFromSession) {
          <label class="field-label" for="oldPassword">Contraseña actual</label>
          <div class="form-group input-icon password-field">
            <input id="oldPassword" [type]="show.old ? 'text' : 'password'" autocomplete="current-password" formControlName="oldPassword" placeholder="Tu contraseña actual" [attr.aria-invalid]="showError('oldPassword')" aria-describedby="oldPassword-error" />
            <i class="fas fa-lock" aria-hidden="true"></i>
            <button type="button" class="toggle-password" (click)="show.old = !show.old" [attr.aria-pressed]="show.old" aria-controls="oldPassword">{{ show.old ? 'Ocultar' : 'Mostrar' }}</button>
          </div>
          <div class="error-message" id="oldPassword-error" aria-live="polite">
            @if (showError('oldPassword')) { <p class="error">Ingresá tu contraseña actual.</p> }
          </div>
          }

          <label class="field-label" for="password1">Nueva contraseña</label>
          <div class="form-group input-icon password-field">
            <input id="password1" [type]="show.p1 ? 'text' : 'password'" autocomplete="new-password" formControlName="password1" placeholder="Mínimo 8 caracteres" [attr.aria-invalid]="showError('password1')" aria-describedby="password1-help password1-error" />
            <i class="fas fa-lock" aria-hidden="true"></i>
            <button type="button" class="toggle-password" (click)="show.p1 = !show.p1" [attr.aria-pressed]="show.p1" aria-controls="password1">{{ show.p1 ? 'Ocultar' : 'Mostrar' }}</button>
          </div>
          <p class="field-help" id="password1-help">Usá al menos 8 caracteres{{ isFromSession ? ', distinta de la actual' : '' }}.</p>
          <div class="error-message" id="password1-error" aria-live="polite">
            @if (showError('password1')) {
              @if (resetPassForm.controls['password1'].getError('required')) { <p class="error">Ingresá la nueva contraseña.</p> }
              @else { <p class="error">La contraseña debe tener al menos 8 caracteres.</p> }
            }
            @if (sameAsOld) { <p class="error">La nueva contraseña tiene que ser distinta de la actual.</p> }
          </div>

          <label class="field-label" for="password2">Repetir nueva contraseña</label>
          <div class="form-group input-icon password-field">
            <input id="password2" [type]="show.p2 ? 'text' : 'password'" autocomplete="new-password" formControlName="password2" placeholder="Repetila para confirmar" [attr.aria-invalid]="showError('password2') || mismatch" aria-describedby="password2-error" />
            <i class="fas fa-lock" aria-hidden="true"></i>
            <button type="button" class="toggle-password" (click)="show.p2 = !show.p2" [attr.aria-pressed]="show.p2" aria-controls="password2">{{ show.p2 ? 'Ocultar' : 'Mostrar' }}</button>
          </div>
          <div class="error-message" id="password2-error" aria-live="polite">
            @if (showError('password2') && resetPassForm.controls['password2'].getError('required')) { <p class="error">Repetí la nueva contraseña.</p> }
            @else if (mismatch) { <p class="error">Las contraseñas no coinciden.</p> }
            @if (submitError) { <p class="error">{{ submitError }}</p> }
          </div>

          @if (saving) {
            <button type="button" class="base-button" disabled>Guardando…</button>
          } @else {
            <button type="submit" class="base-button">Guardar contraseña</button>
          }
          <div class="secondary-actions">
          @if (!isFromSession) {
            <button type="button" class="link" (click)="toLogin()">¿Te acordaste? Ingresar</button>
          } @else {
            <button type="button" class="link" (click)="back()">Volver al panel</button>
          }
          </div>
        </form>
        }
      </div>
    </section>
  `,
})
export class ResetPasswordComponent {
  resetPassForm: FormGroup;
  error: string = '';
  redActive = false;
  protected token: string = '';
  protected isFromSession: boolean = false;
  /** Estados del enlace/flujo: comprobando, inválido (o vencido), error de red, formulario, guardado. */
  linkState: 'checking' | 'invalid' | 'error' | 'form' | 'done' = 'checking';
  show = { old: false, p1: false, p2: false };
  saving = false;
  submitError = '';
  private pendingToken = '';

  showError(field: string): boolean {
    const c = this.resetPassForm.controls[field];
    return !!c && c.invalid && c.touched;
  }
  get mismatch(): boolean {
    const c2 = this.resetPassForm.controls['password2'];
    return c2.touched && !!c2.value && c2.value !== this.resetPassForm.controls['password1'].value;
  }
  get sameAsOld(): boolean {
    const v = this.resetPassForm.value;
    return this.isFromSession && this.resetPassForm.controls['password1'].touched && !!v.password1 && v.password1 === v.oldPassword;
  }
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {
    this.resetPassForm = this.fb.group({
      password1: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required, Validators.minLength(8)]],
      oldPassword: [''],
    });
  }

  ngOnInit() {
    this.activateRoute.params.subscribe((params) => {
      if (params['token']) {
        this.validateToken(params['token']);
      } else if (sessionStorage.getItem('token')) {
        this.isFromSession = true;
        this.resetPassForm.controls['oldPassword'].setValidators([Validators.required]);
        this.resetPassForm.controls['oldPassword'].updateValueAndValidity();
        this.validateToken(sessionStorage.getItem('token') || '');
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }

  validateToken(token: string) {
    this.pendingToken = token;
    this.linkState = 'checking';
    this.sessionService.validateToken(token).subscribe({
      next: (response: boolean) => {
        if (!response) {
          if (this.isFromSession) { this.router.navigate(['auth/login']); return; }
          this.linkState = 'invalid';
        } else {
          this.token = token;
          this.linkState = 'form';
        }
      },
      error: (error) => {
        // 4xx: el servidor rechazó el enlace; 0/5xx: problema de conexión o servidor.
        this.linkState = error?.status && error.status < 500 ? 'invalid' : 'error';
      },
    });
  }

  retryCheck() {
    this.validateToken(this.pendingToken);
  }

  onSubmit() {
    this.submitError = '';
    this.resetPassForm.markAllAsTouched();
    if (this.resetPassForm.invalid || this.mismatch || this.sameAsOld) return;
    if (this.isFromSession) {
      this.changePassword();
    } else {
      this.changePasswordWithToken();
    }
  }

  changePassword() {
    const { oldPassword, password1 } = this.resetPassForm.value;
    this.saving = true;
    this.authService.changePasswordWithOldPassword(oldPassword, password1).subscribe({
      next: () => {
        this.saving = false;
        this.alertService.infoAlert('Contraseña guardada', 'La próxima vez que ingreses, usá tu nueva contraseña.');
        this.router.navigate(['admin']);
      },
      error: (error) => {
        this.saving = false;
        this.submitError = error?.status === 0 ? 'No pudimos conectar con el servidor. Probá de nuevo.' : (error?.error?.error || 'No pudimos guardar la contraseña.');
      },
    });
  }

  changePasswordWithToken() {
    this.saving = true;
    this.authService.resetPasswordSendNewPassword(this.resetPassForm.value.password1, this.token).subscribe({
      next: () => { this.saving = false; this.linkState = 'done'; },
      error: (error) => {
        this.saving = false;
        if (error?.status && error.status < 500 && error.status !== 400) { this.linkState = 'invalid'; return; }
        this.submitError = error?.status === 0 ? 'No pudimos conectar con el servidor. Probá de nuevo.' : (error?.error?.error || 'No pudimos guardar la contraseña.');
      },
    });
  }

  toRequestLink() {
    this.router.navigate(['auth/reset-password']);
  }

  toLogin() {
    this.router.navigate(['auth/login']);
  }

  back() {
    this.router.navigate(['admin']);
  }

}
