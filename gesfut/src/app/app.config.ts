import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';



import { provideServiceWorker } from '@angular/service-worker';
import { pwaConnectionInterceptor } from './core/interceptors/pwa-connection.interceptor';
import { authSessionInterceptor } from './core/interceptors/auth-session.interceptor';
import { tournamentCacheInterceptor } from './core/interceptors/tournament-cache.interceptor';
import { cookieSessionInterceptor } from './core/interceptors/cookie-session.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideClientHydration(), provideHttpClient(withFetch(), withInterceptors([pwaConnectionInterceptor, authSessionInterceptor, tournamentCacheInterceptor, cookieSessionInterceptor])),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerImmediately' })]
};
