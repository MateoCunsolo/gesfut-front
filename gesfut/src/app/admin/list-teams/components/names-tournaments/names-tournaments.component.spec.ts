import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamesTournamentsComponent } from './names-tournaments.component';

describe('NamesTournamentsComponent', () => {
  let component: NamesTournamentsComponent;
  let fixture: ComponentFixture<NamesTournamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamesTournamentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NamesTournamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
