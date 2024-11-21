import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSweetComponent } from './test-sweet.component';

describe('TestSweetComponent', () => {
  let component: TestSweetComponent;
  let fixture: ComponentFixture<TestSweetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSweetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSweetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
