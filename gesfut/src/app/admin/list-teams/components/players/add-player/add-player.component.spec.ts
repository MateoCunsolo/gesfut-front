import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AddPlayerComponent } from './add-player.component';
import { AlertService } from '../../../../../core/services/alert.service';
import { TeamService } from '../../../../../core/services/tournament/team.service';
import { TournamentService } from '../../../../../core/services/tournament/tournament.service';

describe('AddPlayerComponent', () => {
  let getTeam: jasmine.Spy;
  let addPlayerToTeam: jasmine.Spy;

  beforeEach(async () => {
    getTeam = jasmine.createSpy('getTeam').and.returnValue(of({ players: [] }));
    addPlayerToTeam = jasmine.createSpy('addPlayerToTeam').and.returnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [AddPlayerComponent],
      providers: [
        { provide: TeamService, useValue: { getTeam, addPlayerToTeam } },
        { provide: TournamentService, useValue: { getTournamentParticipantTeamByID: () => of(null), addPlayerToParticipant: () => of(null) } },
        { provide: AlertService, useValue: { errorAlert: jasmine.createSpy('errorAlert'), successAlert: jasmine.createSpy('successAlert') } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AddPlayerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no pega a /teams/0 si teamIdGlobal es 0', async () => {
    const fixture = TestBed.createComponent(AddPlayerComponent);
    const c = fixture.componentInstance;
    c.teamIdGlobal = 0;
    fixture.detectChanges();
    await c.callPlayerGlobals();
    c.addPlayerToGlobal({ name: 'Ana', lastName: 'Perez', number: 7, isCaptain: false, isGoalKeeper: false });
    expect(getTeam).not.toHaveBeenCalled();
    expect(addPlayerToTeam).not.toHaveBeenCalled();
  });
});
