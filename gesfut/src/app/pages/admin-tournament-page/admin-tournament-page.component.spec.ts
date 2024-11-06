import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTournamentPageComponent } from './admin-tournament-page.component';

describe('AdminTournamentPageComponent', () => {
  let component: AdminTournamentPageComponent;
  let fixture: ComponentFixture<AdminTournamentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTournamentPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTournamentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
