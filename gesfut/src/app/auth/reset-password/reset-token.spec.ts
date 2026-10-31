import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { AuthService } from '../../core/services/manager/auth.service';
import { changePasswordErrorText, CHANGE_BAD_REQUEST, clearUrlFragment, readResetFragment, RESET_TOO_MANY, resetRequestErrorText } from './reset-token';
import { AUTH_ROUTES, hasResetFragment } from '../auth.routes';
import { ResetPasswordComponent } from './reset-password.component';

describe('reset de contrasena con #t= (plan tokens 31-10 #3)', () => {
  const tok = 'AbC_dEf-0123456789xyzXYZ';

  it('lee el token del fragmento y rechaza lo que no es base64url', () => {
    expect(readResetFragment('#t=' + tok)).toBe(tok);
    expect(readResetFragment('t=' + tok)).toBe(tok);
    expect(readResetFragment('')).toBe('');
    expect(readResetFragment(null)).toBe('');
    expect(readResetFragment('#x=' + tok)).toBe('');
    expect(readResetFragment('#t=corto')).toBe('');
    expect(readResetFragment('#t=<script>alert(1)</script>aaaaaaaa')).toBe('');
  });

  it('borra el fragmento con replaceState, sin tocar ruta ni query', () => {
    const calls: unknown[][] = [];
    const hist = { state: null, replaceState: (...a: unknown[]) => { calls.push(a); } } as unknown as History;
    clearUrlFragment({ pathname: '/auth/reset-password', search: '?a=1', hash: '#t=' + tok }, hist);
    expect(calls).toEqual([[null, '', '/auth/reset-password?a=1']]);
    clearUrlFragment({ pathname: '/x', search: '', hash: '' }, hist);
    expect(calls.length).toBe(1);
  });

  it('mensajes por status: 400, 404, 429', () => {
    expect(resetRequestErrorText(429)).toBe(RESET_TOO_MANY);
    expect(resetRequestErrorText(400)).toContain('Revis');
    expect(resetRequestErrorText(500)).toBe('');
    expect(changePasswordErrorText(404)).toBe('invalid');
    expect(changePasswordErrorText(400)).toBe(CHANGE_BAD_REQUEST);
    expect(changePasswordErrorText(429)).toBe(RESET_TOO_MANY);
    expect(changePasswordErrorText(0)).toBe('');
  });

  it('la ruta con token solo matchea si hay #t= valido', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.runInInjectionContext(() => {
      expect(hasResetFragment('t=' + tok)).toBeTrue();
      expect(hasResetFragment('')).toBeFalse();
    });
  });

  it('AuthService manda email y {token,password} en el body JSON, nunca en la URL', () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    const auth = TestBed.inject(AuthService);
    const ctrl = TestBed.inject(HttpTestingController);
    auth.resetPasswordSendEmail('prueba@example.com').subscribe();
    const r1 = ctrl.expectOne(r => r.url.endsWith('/auth/reset-password'));
    expect(r1.request.method).toBe('POST');
    expect(r1.request.body).toEqual({ email: 'prueba@example.com' });
    expect(r1.request.url).not.toContain('prueba');
    r1.flush(null);
    auth.resetPasswordSendNewPassword('clave-de-prueba', tok).subscribe();
    const r2 = ctrl.expectOne(r => r.url.endsWith('/auth/change-password'));
    expect(r2.request.body).toEqual({ token: tok, password: 'clave-de-prueba' });
    expect(r2.request.url).not.toContain(tok);
    r2.flush(null);
    ctrl.verify();
  });

  it('la ruta vieja reset-password/:token redirige a reset-password sin el token', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(AUTH_ROUTES), provideHttpClient(), provideHttpClientTesting()] });
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/reset-password/' + tok);
    expect(router.url).toBe('/reset-password');
  });

  it('ngOnDestroy quita la meta referrer y vacia el token', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    const meta = TestBed.inject(Meta);
    const cmp = TestBed.createComponent(ResetPasswordComponent).componentInstance as unknown as { token: string; ngOnDestroy(): void };
    meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    cmp.token = tok;
    cmp.ngOnDestroy();
    expect(cmp.token).toBe('');
    expect(meta.getTag("name='referrer'")).toBeNull();
  });
});
