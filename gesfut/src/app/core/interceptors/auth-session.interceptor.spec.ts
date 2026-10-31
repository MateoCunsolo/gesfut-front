import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
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

  afterEach(() => { ctrl.verify(); sessionStorage.clear(); });

  it('un 401 suelto con validate=true no desloguea', () => {
    setup(60_000);
    http.get('/api/x', auth).subscribe({ error: () => {} });
    ctrl.expectOne('/api/x').flush(null, { status: 401, statusText: 'Unauthorized' });
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(true);
    expect(session.expireSession).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('token')).toBe(SessionService.COOKIE_MARKER);
  });

  it('con la sesion invalidada (validate=false) desloguea', () => {
    setup(60_000);
    http.get('/api/x', auth).subscribe({ error: () => {} });
    ctrl.expectOne('/api/x').flush(null, { status: 401, statusText: 'Unauthorized' });
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(false);
    expect(session.expireSession).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('con sessionExp vencido desloguea sin llamar a la red', () => {
    setup(-1_000);
    http.get('/api/x', auth).subscribe({ error: () => {} });
    ctrl.expectOne('/api/x').flush(null, { status: 401, statusText: 'Unauthorized' });
    ctrl.expectNone(r => r.url.endsWith('/validate-token'));
    expect(session.expireSession).toHaveBeenCalledTimes(1);
  });

  it('dos 401 juntos hacen una sola consulta a /validate-token', () => {
    setup(60_000);
    http.get('/api/a', auth).subscribe({ error: () => {} });
    http.get('/api/b', auth).subscribe({ error: () => {} });
    ctrl.expectOne('/api/a').flush(null, { status: 401, statusText: 'Unauthorized' });
    ctrl.expectOne('/api/b').flush(null, { status: 401, statusText: 'Unauthorized' });
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).flush(true);
    expect(session.expireSession).not.toHaveBeenCalled();
  });

  it('sin red en /validate-token no desloguea', () => {
    setup(60_000);
    http.get('/api/x', auth).subscribe({ error: () => {} });
    ctrl.expectOne('/api/x').flush(null, { status: 401, statusText: 'Unauthorized' });
    ctrl.expectOne(r => r.url.endsWith('/validate-token')).error(new ProgressEvent('error'), { status: 0 });
    expect(session.expireSession).not.toHaveBeenCalled();
  });
});
