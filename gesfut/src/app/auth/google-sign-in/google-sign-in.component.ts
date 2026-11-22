import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/manager/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../enviroments/environment';
import { TOO_MANY_ATTEMPTS } from '../auth-messages';

/** Script oficial de Google Identity Services. */
export const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
export const GOOGLE_LOGIN_GENERIC_ERROR = 'No pudimos ingresar con Google. Probá de nuevo.';

let gisScript: Promise<void> | null = null;

/** Carga el script de GIS una sola vez (si falla, se puede reintentar en la próxima pantalla). */
export function loadGisScript(doc: Document = document): Promise<void> {
  const w = doc.defaultView as any;
  if (w?.google?.accounts?.id) return Promise.resolve();
  if (gisScript) return gisScript;
  gisScript = new Promise<void>((resolve, reject) => {
    const s = doc.createElement('script');
    s.src = GIS_SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { gisScript = null; s.remove(); reject(new Error('gis')); };
    doc.head.appendChild(s);
  });
  return gisScript;
}

/** Lee el email del ID token solo para separar datos locales por cuenta (igual que el login normal). No valida nada: valida el back. */
export function emailFromCredential(credential: string): string {
  try {
    const part = credential.split('.')[1] ?? '';
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '='));
    const email = JSON.parse(json)?.email;
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  } catch { return ''; }
}

/**
 * Botón oficial "Continuar con Google" (google.accounts.id.renderButton).
 * El client ID sale de GET /api/v1/auth/google/config; si responde 404 o error, no se muestra nada.
 */
@Component({
  selector: 'app-google-sign-in',
  standalone: true,
  template: `
    @if (enabled) {
      <div class="google-sign-in">
        <div #button class="google-sign-in__button"></div>
        @if (signup) {
          <p class="google-sign-in__terms">Al continuar con Google aceptás los <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.</p>
        }
      </div>
    }
  `,
  styles: [`
    .google-sign-in { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px; }
    .google-sign-in__button { min-height: 44px; display: flex; justify-content: center; }
    .google-sign-in__terms { margin: 0; font-size: 13px; text-align: center; }
  `],
})
export class GoogleSignInComponent implements OnInit, OnDestroy {
  /** true en /auth/signup: muestra la línea de términos (el click cuenta como aceptación). */
  @Input() signup = false;
  @ViewChild('button') set buttonRef(ref: ElementRef<HTMLElement> | undefined) {
    this.buttonEl = ref?.nativeElement;
    this.render();
  }

  protected enabled = false;
  private clientId = '';
  private buttonEl?: HTMLElement;
  private rendered = false;
  private destroyed = false;
  private busy = false;

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private zone = inject(NgZone);

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    this.http.get<{ clientId?: string }>(`${environment.apiUrl}/auth/google/config`).subscribe({
      next: (cfg) => {
        const id = typeof cfg?.clientId === 'string' ? cfg.clientId.trim() : '';
        if (!id || this.destroyed) return;
        loadGisScript().then(() => {
          if (this.destroyed) return;
          this.clientId = id;
          this.enabled = true;
          this.render();
        }).catch(() => { /* sin GIS (bloqueado u offline): no se muestra el botón */ });
      },
      error: () => { /* 404 = login con Google apagado */ },
    });
  }

  ngOnDestroy(): void { this.destroyed = true; }

  private render(): void {
    const gid = (window as any).google?.accounts?.id;
    if (!this.enabled || !this.buttonEl || this.rendered || !gid) return;
    this.rendered = true;
    gid.initialize({
      client_id: this.clientId,
      callback: (r: { credential?: string }) => this.zone.run(() => this.onCredential(r?.credential)),
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
      context: this.signup ? 'signup' : 'signin',
    });
    gid.renderButton(this.buttonEl, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      logo_alignment: 'left',
      locale: 'es-419',
      width: Math.min(320, Math.max(200, this.buttonEl.parentElement?.clientWidth ?? 320)),
    });
  }

  private onCredential(credential?: string): void {
    if (!credential || this.busy) return;
    this.busy = true;
    this.alertService.loadingAlert('Ingresando con Google...');
    this.authService.loginWithGoogle(credential, emailFromCredential(credential)).subscribe({
      next: () => {
        this.busy = false;
        this.alertService.closeLoadingAlert();
        this.dashboardService.setActiveDashboardAdminComponent('dashboard');
        this.router.navigate(['/admin']);
      },
      error: (error: HttpErrorResponse) => {
        this.busy = false;
        const msg = typeof error?.error?.error === 'string' && error.error.error ? error.error.error : GOOGLE_LOGIN_GENERIC_ERROR;
        this.alertService.errorAlert(error?.status === 429 ? TOO_MANY_ATTEMPTS : msg);
        this.authService.serverNotResponding(error);
      },
    });
  }
}
