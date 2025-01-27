import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamesTeamsComponent } from './names-teams.component';

describe('NamesTeamsComponent', () => {
  let component: NamesTeamsComponent;
  let fixture: ComponentFixture<NamesTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamesTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NamesTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
