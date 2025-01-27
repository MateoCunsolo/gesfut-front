import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersTournamentComponent } from './players-tournament.component';

describe('PlayersTournamentComponent', () => {
  let component: PlayersTournamentComponent;
  let fixture: ComponentFixture<PlayersTournamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersTournamentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
