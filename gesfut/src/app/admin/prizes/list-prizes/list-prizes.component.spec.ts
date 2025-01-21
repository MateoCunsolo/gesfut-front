import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPrizesComponent } from './list-prizes.component';

describe('ListPrizesComponent', () => {
  let component: ListPrizesComponent;
  let fixture: ComponentFixture<ListPrizesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPrizesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPrizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
