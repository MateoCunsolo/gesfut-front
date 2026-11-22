import { Component, HostListener, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from "./shared/header/header.component";
import { PwaStatusComponent } from './shared/pwa-status/pwa-status.component';
import { FooterComponent } from "./shared/footer/footer.component";
import { AlertService } from './core/services/alert.service';
import { SessionService } from './core/services/manager/session.service';
import { applyAccountSwitchReload, ME_NETWORK_MESSAGE, readSessionAccount, sessionAccountChanged, sessionAccountHash } from './core/utils/session-account';

@Component({
    selector: 'app-root',
    imports: [HeaderComponent, FooterComponent, RouterOutlet, PwaStatusComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gesfut-front';
  /** Aviso no bloqueante si otra pestaña inicio sesion con otra cuenta. No recarga solo. */
  accountSwitchNotice = false;
  private reloadBusy = false;
  private readonly sessionService = inject(SessionService);
  private readonly alertService = inject(AlertService);

  /** Plan 22/10 #10: "Saltar al contenido" mueve el foco al contenido sin tocar la URL ni el router. */
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView();
  }

  ngOnInit(): void {
    window.addEventListener('popstate', (event: PopStateEvent) => {
      if (event.state) {
        window.location.reload();
      }
    });
    this.checkAccountSwitch();
  }

  @HostListener('window:focus')
  @HostListener('document:visibilitychange')
  onSessionAccountCheck(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    this.checkAccountSwitch();
  }

  private checkAccountSwitch(): void {
    if (this.accountSwitchNotice) return;
    try {
      const shared = readSessionAccount(typeof localStorage !== 'undefined' ? localStorage : null);
      void sessionAccountHash(sessionStorage.getItem('email')).then((ui) => {
        if (this.accountSwitchNotice) return;
        if (sessionAccountChanged(ui, shared)) this.accountSwitchNotice = true;
      }).catch(() => { /* sin hash */ });
    } catch { /* sin storage */ }
  }

  reloadAfterAccountSwitch(): void {
    if (this.reloadBusy) return;
    this.reloadBusy = true;
    const session = typeof sessionStorage !== 'undefined' ? sessionStorage : null;
    const local = typeof localStorage !== 'undefined' ? localStorage : null;
    if (!session || !local) {
      this.reloadBusy = false;
      this.alertService.errorAlert(ME_NETWORK_MESSAGE);
      return;
    }
    void applyAccountSwitchReload({
      fetchMe: async () => {
        try {
          const body = await firstValueFrom(this.sessionService.getCurrentUser());
          return { status: 200, body };
        } catch (err) {
          if (err instanceof HttpErrorResponse) {
            return { status: err.status || 0, body: null };
          }
          throw err;
        }
      },
      session,
      local,
    }).then((outcome) => {
      if (outcome === 'updated') {
        this.accountSwitchNotice = false;
        // Identidad y role ya estan en sessionStorage: recargar no rebota en /admin.
        window.location.reload();
        return;
      }
      if (outcome === 'unauthorized') {
        this.sessionService.expireSession();
        return;
      }
      this.alertService.errorAlert(ME_NETWORK_MESSAGE);
    }).catch(() => {
      this.alertService.errorAlert(ME_NETWORK_MESSAGE);
    }).finally(() => {
      this.reloadBusy = false;
    });
  }
}
