import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizeDashboardComponent } from './prize-dashboard.component';

describe('PrizeDashboardComponent', () => {
  let component: PrizeDashboardComponent;
  let fixture: ComponentFixture<PrizeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrizeDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrizeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
