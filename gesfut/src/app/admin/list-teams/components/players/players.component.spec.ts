import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { PlayersComponent } from './players.component';
import { AlertService } from '../../../../core/services/alert.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { GuestService } from '../../../../core/services/guest/guest.service';
import { TeamRemovalService } from '../../../../core/services/tournament/team-removal.service';
import { TeamService } from '../../../../core/services/tournament/team.service';
import { TournamentService } from '../../../../core/services/tournament/tournament.service';

@Component({ selector: 'app-delete-player', standalone: true, template: '' })
class DeleteStub {}

@Component({
  selector: 'app-add-player',
  standalone: true,
  template: '',
  inputs: ['destinationName', 'teamIdGlobal', 'teamIdParticipant', 'codeTournament', 'playerDeleted'],
})
class AddStub {
  teamIdGlobal = 0;
}

describe('PlayersComponent', () => {
  let getTeam: jasmine.Spy;

  beforeEach(async () => {
    getTeam = jasmine.createSpy('getTeam').and.returnValue(of({ players: [] }));
    await TestBed.configureTestingModule({
      imports: [PlayersComponent],
      providers: [
        { provide: TeamService, useValue: { getTeam, getAllStatsPlayersFromTeam: () => of(null) } },
        { provide: TournamentService, useValue: {} },
        { provide: AlertService, useValue: { errorAlert: jasmine.createSpy('errorAlert'), successAlert: jasmine.createSpy('successAlert'), editPlayerAlert: () => Promise.resolve(null) } },
        { provide: DashboardService, useValue: {} },
        { provide: GuestService, useValue: {} },
        { provide: TeamRemovalService, useValue: {} },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).overrideComponent(PlayersComponent, {
      set: { imports: [DeleteStub, AddStub] },
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayersComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('editPlayer pide el equipo elegido, no el idTeam 0 de las stats vacias', () => {
    const fixture = TestBed.createComponent(PlayersComponent);
    const c = fixture.componentInstance;
    c.idTeam = 17;
    c.isGlobalTeam = true;
    c.editPlayer({ playerId: 3, playerName: 'Ana', playerLastName: 'Perez', shirtNumber: 10 });
    expect(getTeam).toHaveBeenCalledWith(17);
    expect(getTeam).not.toHaveBeenCalledWith(0);
  });

  it('Agregar usa el id del equipo elegido aunque las stats sigan en 0', () => {
    const fixture = TestBed.createComponent(PlayersComponent);
    const c = fixture.componentInstance;
    c.idTeam = 17;
    c.isGlobalTeam = true;
    (c as any).flagAddPlayer = true;
    fixture.detectChanges();
    expect((c as any).currentTeamId()).toBe(17);
    const add = fixture.debugElement.query(By.directive(AddStub));
    expect(add).withContext('app-add-player').toBeTruthy();
    expect(add.componentInstance.teamIdGlobal).toBe(17);
  });
});
