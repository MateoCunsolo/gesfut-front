import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authSessionInterceptor } from './auth-session.interceptor';
import { SessionService } from '../services/manager/session.service';

describe('authSessionInterceptor (plan tokens 31-10 #6)', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let session: SessionService;
  const auth = { headers: { Authorization: `Bearer ${SessionService.COOKIE_MARKER}` } };

  function setup(expMs: number) {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authSessionInterceptor])), provideHttpClientTesting()]
    });
    session = TestBed.inject(SessionService);
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    sessionStorage.setItem('token', SessionService.COOKIE_MARKER);
    sessionStorage.setItem('sessionExp', String(Date.now() + expMs));
    spyOn(session, 'expireSession').and.callThrough();
  }

  function call(url: string): { status?: number } {
    const got: { status?: number } = {};
    http.get(url, auth).subscribe({ error: (e: HttpErrorResponse) => got.status = e.status });
    return got;
  }
  const r401 = { status: 401, statusText: 'Unauthorized' };

  afterEach(() => { ctrl.verify(); sessionStorage.clear(); });

  it('un 401 suelto con validate=true no desloguea', () => {
    setup(60_000);
    const resx = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, r401);
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(true);
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('token')).toBe(SessionService.COOKIE_MARKER);
    expect(resx.status).toBe(401);
  });

  it('con la sesion invalidada (validate=false) desloguea', () => {
    setup(60_000);
    const resx = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, r401);
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(false);
    expect(session.expireSession).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(resx.status).toBe(401);
  });

  it('con sessionExp vencido desloguea sin llamar a la red', () => {
    setup(-1_000);
    const resx = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, r401);
    ctrl.expectNone(r => r.url.endsWith('/validate-token'));
    expect(session.expireSession).toHaveBeenCalledTimes(1);
    expect(resx.status).toBe(401);
  });

  it('dos 401 juntos hacen una sola consulta a /validate-token', () => {
    setup(60_000);
    const resa = call('/api/a');
    const resb = call('/api/b');
    ctrl.expectOne('/api/a').flush(null, r401);
    ctrl.expectOne('/api/b').flush(null, r401);
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(true);
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(resa.status).toBe(401);
    expect(resb.status).toBe(401);
  });

  it('sin red en /validate-token no desloguea', () => {
    setup(60_000);
    const resx = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, r401);
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).error(new ProgressEvent('error'), { status: 0 });
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(resx.status).toBe(401);
  });

  it('/validate-token responde 401: se cierra la sesion', () => {
    setup(60_000);
    const res = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, r401);
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(null, r401);
    expect(session.expireSession).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(res.status).toBe(401);
  });

  it('/validate-token responde 5xx: no se cierra la sesion', () => {
    setup(60_000);
    const res = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, r401);
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(null, { status: 503, statusText: 'Unavailable' });
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('token')).toBe(SessionService.COOKIE_MARKER);
    expect(res.status).toBe(401);
  });

  it('403 de rol con sesion vigente: no se cierra ni valida, y el llamador recibe el 403', () => {
    setup(60_000);
    const res = call('/api/x');
    ctrl.expectOne('/api/x').flush(null, { status: 403, statusText: 'Forbidden' });
    ctrl.expectNone(r => r.url.endsWith('/validate-token'));
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
  });

  it('una llamada marcada con SKIP_SESSION_CHECK (validateToken) no dispara otra validacion', () => {
    setup(60_000);
    let status: number | undefined;
    session.validateToken(SessionService.COOKIE_MARKER).subscribe({ error: (e: HttpErrorResponse) => status = e.status });
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(null, r401);
    ctrl.expectNone(r => r.url.endsWith('/validate-token'));
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(status).toBe(401);
  });
});
