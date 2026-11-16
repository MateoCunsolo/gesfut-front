import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { PwaStatusComponent } from './shared/pwa-status/pwa-status.component';
import { FooterComponent } from "./shared/footer/footer.component";
import { parseSessionAccount, readSessionAccount, sessionAccountChanged, sessionAccountFingerprint } from './core/utils/session-account';

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
      const ui = sessionAccountFingerprint({
        email: sessionStorage.getItem('email'),
        name: sessionStorage.getItem('name'),
        lastName: sessionStorage.getItem('lastName'),
      });
      const shared = readSessionAccount(typeof localStorage !== 'undefined' ? localStorage : null);
      if (sessionAccountChanged(ui, shared)) this.accountSwitchNotice = true;
    } catch { /* sin storage */ }
  }

  reloadAfterAccountSwitch(): void {
    try {
      const shared = readSessionAccount(typeof localStorage !== 'undefined' ? localStorage : null);
      const parsed = parseSessionAccount(shared);
      if (parsed) {
        if (parsed.email) sessionStorage.setItem('email', parsed.email);
        sessionStorage.setItem('name', parsed.name ?? '');
        sessionStorage.setItem('lastName', parsed.lastName ?? '');
      }
    } catch { /* sin storage */ }
    window.location.reload();
  }
}
