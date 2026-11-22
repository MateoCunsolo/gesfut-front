import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { AlertService } from './core/services/alert.service';
import { SessionService } from './core/services/manager/session.service';

@Component({ selector: 'app-header', standalone: true, template: '' })
class HeaderStub {}

@Component({ selector: 'app-footer', standalone: true, template: '' })
class FooterStub {}

@Component({ selector: 'app-pwa-status', standalone: true, template: '' })
class PwaStub {}

@Component({ selector: 'router-outlet', standalone: true, template: '' })
class OutletStub {}

describe('AppComponent', () => {
  let getCurrentUser: jasmine.Spy;
  let expireSession: jasmine.Spy;

  beforeEach(async () => {
    getCurrentUser = jasmine.createSpy('getCurrentUser').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
    );
    expireSession = jasmine.createSpy('expireSession');
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: SessionService, useValue: { getCurrentUser, expireSession } },
        { provide: AlertService, useValue: { errorAlert: jasmine.createSpy('errorAlert') } },
      ],
    }).overrideComponent(AppComponent, {
      set: { imports: [HeaderStub, FooterStub, PwaStub, OutletStub] },
    }).compileComponents();

    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem('email', 'qa@example.test');
    sessionStorage.setItem('token', 'cookie');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('despues de un 401, Recargar no queda muerto y se puede volver a pulsar', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.accountSwitchNotice = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.account-switch-notice button') as HTMLButtonElement;
    expect(btn).withContext('boton Recargar').toBeTruthy();
    expect(btn.textContent ?? '').toContain('Recargar');

    btn.click();
    await fixture.whenStable();
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(expireSession).toHaveBeenCalledTimes(1);

    btn.click();
    await fixture.whenStable();
    expect(getCurrentUser).toHaveBeenCalledTimes(2);
    expect(expireSession).toHaveBeenCalledTimes(2);
  });
});
