import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({ providedIn: 'root' })
export class PwaService {
  readonly online = signal(true);
  readonly serverUnavailable = signal(false);
  readonly installAvailable = signal(false);
  readonly iosInstallHelp = signal(false);
  readonly updateAvailable = signal(false);
  readonly reloadRequired = signal(false);
  readonly installing = signal(false);
  readonly workerEnabled = signal(false);
  readonly workerReady = signal(false);
  readonly message = signal('');
  private promptEvent: InstallPrompt | null = null;
  private readonly updates = inject(SwUpdate);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    this.workerEnabled.set(this.updates.isEnabled);
    if (this.updates.isEnabled && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then(registration => this.workerReady.set(registration.active !== null));
    }
    this.online.set(navigator.onLine);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    this.iosInstallHelp.set(ios && !standalone && window.isSecureContext);
    fromEvent(window, 'online').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.online.set(true));
    fromEvent(window, 'offline').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.online.set(false));
    fromEvent<Event>(window, 'beforeinstallprompt').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      event.preventDefault();
      this.promptEvent = event as InstallPrompt;
      this.installAvailable.set(true);
    });
    fromEvent(window, 'appinstalled').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.promptEvent = null;
      this.installAvailable.set(false);
      this.iosInstallHelp.set(false);
      this.message.set('Gesfut se instaló correctamente.');
    });
    if (this.updates.isEnabled) {
      this.updates.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
        if (event.type === 'VERSION_READY') this.updateAvailable.set(true);
      });
      this.updates.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reloadRequired.set(true));
      fromEvent(window, 'online').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        void this.updates.checkForUpdate().catch(() => undefined);
      });
    }
  }

  async install(): Promise<void> {
    if (!this.promptEvent || this.installing()) return;
    const event = this.promptEvent;
    this.promptEvent = null;
    this.installing.set(true);
    this.installAvailable.set(false);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === 'dismissed') this.message.set('Podés instalar Gesfut más adelante desde el menú del navegador.');
    } catch {
      this.message.set('No se pudo abrir la instalación. Probá desde el menú del navegador.');
    } finally {
      this.installing.set(false);
    }
  }

  update(): void {
    // Recargar mantiene unidos el HTML y los archivos de una misma versión.
    window.location.reload();
  }
}
