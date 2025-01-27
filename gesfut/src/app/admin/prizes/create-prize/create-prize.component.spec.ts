import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrizeComponent } from './create-prize.component';

describe('CreatePrizeComponent', () => {
  let component: CreatePrizeComponent;
  let fixture: ComponentFixture<CreatePrizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePrizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePrizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
