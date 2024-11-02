import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitializeTournamentComponent } from './initialize-tournament.component';

describe('InitializeTournamenteComponent', () => {
  let component: InitializeTournamentComponent;
  let fixture: ComponentFixture<InitializeTournamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitializeTournamentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitializeTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
