import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastsMatchesComponent } from './lasts-matches.component';

describe('LastsMatchesComponent', () => {
  let component: LastsMatchesComponent;
  let fixture: ComponentFixture<LastsMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastsMatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastsMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
