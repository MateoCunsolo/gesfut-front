import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMatchDaysComponent } from './list-match-days.component';

describe('ListMatchDaysComponent', () => {
  let component: ListMatchDaysComponent;
  let fixture: ComponentFixture<ListMatchDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMatchDaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMatchDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
