import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTeamsTournamentsComponent } from './list-teams-tournaments.component';

describe('ListTeamTournamentsComponent', () => {
  let component: ListTeamsTournamentsComponent;
  let fixture: ComponentFixture<ListTeamsTournamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTeamsTournamentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTeamsTournamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
