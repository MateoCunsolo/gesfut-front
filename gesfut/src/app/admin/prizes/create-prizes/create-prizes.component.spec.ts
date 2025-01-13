import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrizesComponent } from './create-prizes.component';

describe('CreatePrizesComponent', () => {
  let component: CreatePrizesComponent;
  let fixture: ComponentFixture<CreatePrizesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePrizesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePrizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
