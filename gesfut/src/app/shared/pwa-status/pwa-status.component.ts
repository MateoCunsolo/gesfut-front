import { Component, inject, signal } from '@angular/core';
import { PwaService } from '../../core/services/pwa.service';
import { dismissPwaHint, isPwaHintDismissed } from './pwa-hint';

@Component({
  selector: 'app-pwa-status',
  standalone: true,
  host: {
    '[attr.data-worker-enabled]': 'pwa.workerEnabled()',
    '[attr.data-worker-ready]': 'pwa.workerReady()'
  },
  template: `
    @if (!pwa.online()) {
      <div class="connection-notice" role="status">Sin conexión. Para consultar datos actuales o guardar cambios, volvé a conectarte.</div>
    } @else if (pwa.serverUnavailable()) {
      <div class="connection-notice" role="status">No se pudo conectar con el servidor. Para consultar datos actuales o guardar cambios, necesitás conexión.</div>
    }
    @if (pwa.installAvailable() || showIosHint() || pwa.updateAvailable() || pwa.reloadRequired() || pwa.message()) {
      <aside class="pwa-actions" aria-label="Instalación y actualizaciones de Gesfut">
        @if (pwa.installAvailable()) { <button type="button" (click)="pwa.install()" [disabled]="pwa.installing()">Instalar Gesfut</button> }
        @if (showIosHint()) { <p>Para instalar Gesfut en iPhone o iPad: abrí Compartir y elegí «Agregar a pantalla de inicio».</p> <button type="button" aria-label="Cerrar aviso" (click)="closeIosHint()">&times;</button> }
        @if (pwa.updateAvailable() || pwa.reloadRequired()) {
          <p>Hay una actualización. Guardá tus cambios antes de recargar.</p>
          <button type="button" (click)="pwa.update()">Actualizar Gesfut</button>
        }
        @if (pwa.message()) { <p role="status">{{ pwa.message() }}</p> }
      </aside>
    }
  `,
  styles: `
    .connection-notice, .pwa-actions { padding: 12px 16px; font-size: 1.4rem; line-height: 1.5; }
    .connection-notice { background: var(--terciary-color); color: var(--font-color-dark); }
    .pwa-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; background: var(--bg-color); border-bottom: 1px solid var(--primary-color); }
    p { max-width: 65ch; }
    button { min-height: 44px; padding: 10px 16px; border: 1px solid var(--primary-color); border-radius: 5px; background: var(--primary-color); color: var(--font-color-ligth); font: inherit; cursor: pointer; }
    button:disabled { opacity: .6; cursor: default; }
  `
})
export class PwaStatusComponent {
  readonly pwa = inject(PwaService);
  protected readonly iosHintDismissed = signal(isPwaHintDismissed());
  protected showIosHint(): boolean { return this.pwa.iosInstallHelp() && !this.iosHintDismissed(); }
  protected closeIosHint(): void { dismissPwaHint(); this.iosHintDismissed.set(true); }
}
