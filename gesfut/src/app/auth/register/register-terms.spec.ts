import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { AlertService } from '../../core/services/alert.service';
import { routes } from '../../app.routes';

/** Tema 7 (5/11): aceptacion de Terminos y Privacidad en el registro y paginas legales publicas. Datos TEST. */
describe('registro con Terminos y Privacidad (tema 7)', () => {
  function setup() {
    sessionStorage.clear();
    const alerts = jasmine.createSpyObj('AlertService', ['successAlert', 'errorAlert', 'infoAlert']);
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: AlertService, useValue: alerts }] });
    const ctrl = TestBed.inject(HttpTestingController);
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const type = (id: string, v: string) => { const i = el.querySelector<HTMLInputElement>('#' + id)!; i.value = v; i.dispatchEvent(new Event('input')); };
    type('name', 'QaNombre'); type('lastName', 'QaApellido'); type('email', 'qa.terms@example.test'); type('password', 'clave-test-1');
    fixture.detectChanges();
    return { fixture, el, ctrl };
  }
  const submit = (el: HTMLElement) => el.querySelector('button[type=submit]') as HTMLButtonElement;

  it('el boton queda deshabilitado hasta tildar el checkbox', () => {
    const { fixture, el } = setup();
    expect(submit(el).disabled).toBeTrue();
    const box = el.querySelector<HTMLInputElement>('#acceptedTerms')!;
    box.click(); fixture.detectChanges();
    expect(submit(el).disabled).toBeFalse();
    box.click(); fixture.detectChanges();
    expect(submit(el).disabled).toBeTrue();
  });

  it('sin tildar, Enter (submit del form) no manda nada y muestra el aviso', () => {
    const { fixture, el, ctrl } = setup();
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    ctrl.expectNone(r => r.url.endsWith('/auth/signup'));
    expect(el.querySelector('#acceptedTerms-error')!.textContent).toContain('aceptar');
  });

  it('tildado, el POST de registro manda acceptedTerms: true', () => {
    const { fixture, el, ctrl } = setup();
    el.querySelector<HTMLInputElement>('#acceptedTerms')!.click(); fixture.detectChanges();
    submit(el).click(); fixture.detectChanges();
    const req = ctrl.expectOne(r => r.url.endsWith('/auth/signup'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.acceptedTerms).toBeTrue();
    expect(req.request.body.email).toBe('qa.terms@example.test');
  });

  it('los links abren /terminos y /privacidad en pestana nueva con noopener', () => {
    const { el } = setup();
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('label[for=acceptedTerms] a'));
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/terminos', '/privacidad']);
    for (const a of links) { expect(a.target).toBe('_blank'); expect(a.rel).toContain('noopener'); }
  });

  it('/terminos y /privacidad son publicas y muestran titulo y terminos beta', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/terminos');
    expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toContain('T\u00e9rminos y Condiciones');
    expect(harness.routeNativeElement!.textContent).toContain('Gesfut est\u00e1 en beta');
    expect(harness.routeNativeElement!.textContent).toContain('contacto@gesfut.site');
    await harness.navigateByUrl('/privacidad');
    expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toContain('Pol\u00edtica de Privacidad');
    expect(harness.routeNativeElement!.textContent).toContain('Gesfut est\u00e1 en beta');
    expect(TestBed.inject(Router).url).toBe('/privacidad');
  });
});
