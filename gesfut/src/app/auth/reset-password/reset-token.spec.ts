import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { AuthService } from '../../core/services/manager/auth.service';
import { changePasswordErrorText, CHANGE_BAD_REQUEST, clearUrlFragment, isResetLinkUrl, readResetFragment, RESET_TOO_MANY, resetRequestErrorText } from './reset-token';
import { AUTH_ROUTES, hasResetFragment } from '../auth.routes';
import { ResetPasswordComponent } from './reset-password.component';
import { SessionService } from '../../core/services/manager/session.service';
import { AlertService } from '../../core/services/alert.service';
import { isAuthGuard } from '../../core/guards/is-auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

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

  // Punto 4 (5/11): link de reset con sesion abierta.
  it('isResetLinkUrl reconoce solo /auth/reset-password con #t= valido', () => {
    expect(isResetLinkUrl('/auth/reset-password#t=' + tok)).toBeTrue();
    expect(isResetLinkUrl('/auth/reset-password/?a=1#t=' + tok)).toBeTrue();
    expect(isResetLinkUrl('/auth/reset-password')).toBeFalse();
    expect(isResetLinkUrl('/auth/reset-password#t=corto')).toBeFalse();
    expect(isResetLinkUrl('/auth/login#t=' + tok)).toBeFalse();
    expect(isResetLinkUrl('/admin#t=' + tok)).toBeFalse();
    expect(isResetLinkUrl(null)).toBeFalse();
  });

  it('logueado: el guard deja abrir el link de reset y sigue mandando a /admin el resto de auth', async () => {
    const navigate = jasmine.createSpy('navigate');
    const fakeSession = { loggingOut: false, ready: Promise.resolve(), isAuth: () => true };
    TestBed.configureTestingModule({ providers: [{ provide: SessionService, useValue: fakeSession }, { provide: Router, useValue: { navigate } }] });
    const run = (url: string) => TestBed.runInInjectionContext(() => isAuthGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot));
    expect(await run('/auth/reset-password#t=' + tok)).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
    expect(await run('/auth/login')).toBeFalse();
    expect(navigate).toHaveBeenCalledWith(['/admin']);
    expect(await run('/auth/reset-password')).toBeFalse();
  });

  it('logueado: muestra el formulario del link y al guardar limpia la sesion local y va al login', () => {
    sessionStorage.clear(); localStorage.removeItem('token');
    sessionStorage.setItem('token', 'cookie');
    sessionStorage.setItem('sessionExp', String(Date.now() + 3_600_000));
    sessionStorage.setItem('name', 'QaNombre'); sessionStorage.setItem('lastName', 'QaApellido'); sessionStorage.setItem('role', 'ADMIN');
    sessionStorage.setItem('email', 'qa@example.test');
    const original = location.pathname + location.search;
    history.replaceState(history.state, '', original + '#t=' + tok);
    const alerts = jasmine.createSpyObj('AlertService', ['infoAlert', 'errorAlert', 'successAlert']);
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: AlertService, useValue: alerts }] });
    const ctrl = TestBed.inject(HttpTestingController);
    ctrl.match(r => r.url.endsWith('/auth/validate-token')).forEach(r => r.flush(true));
    const router = TestBed.inject(Router);
    const nav = spyOn(router, 'navigate').and.resolveTo(true);
    const session = TestBed.inject(SessionService);
    const meta = TestBed.inject(Meta);
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as { linkState: string; token: string; resetPassForm: { setValue(v: unknown): void }; onSubmit(): void; isFromSession: boolean };
    expect(cmp.linkState).toBe('form');
    expect(cmp.isFromSession).toBeFalse();
    expect(location.hash).toBe('', 'el token sale de la URL con replaceState');
    expect(meta.getTag("name='referrer'")?.content).toBe('no-referrer');
    expect(nav).not.toHaveBeenCalled();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#password1')).not.toBeNull();
    expect(el.querySelector('#oldPassword')).toBeNull();

    cmp.resetPassForm.setValue({ password1: 'nueva-de-prueba-1', password2: 'nueva-de-prueba-1', oldPassword: '' });
    cmp.onSubmit();
    const req = ctrl.expectOne(r => r.url.endsWith('/auth/change-password'));
    expect(req.request.body).toEqual({ token: tok, password: 'nueva-de-prueba-1' });
    req.flush(null);

    for (const k of ['token', 'sessionExp', 'name', 'lastName', 'role', 'email']) expect(sessionStorage.getItem(k)).toBeNull();
    expect(session.isAuth()).toBeFalse();
    expect(session.sessionExpired).toBeFalse();
    expect(nav).toHaveBeenCalledWith(['auth/login']);
    expect(cmp.token).toBe('');
    const stored = JSON.stringify({ ...sessionStorage }) + JSON.stringify({ ...localStorage });
    expect(stored).not.toContain(tok);
    expect(stored).not.toContain('nueva-de-prueba-1');
    history.replaceState(history.state, '', original);
  });
});
