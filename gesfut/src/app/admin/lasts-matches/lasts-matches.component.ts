import { Component, inject } from '@angular/core';
import { MatchResponse } from '../../core/models/tournamentResponse';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/manager/auth.service';
import { GuestService } from '../../core/services/guest/guest.service';

@Component({
    selector: 'app-lasts-matches',
    imports: [NgClass],
    templateUrl: './lasts-matches.component.html',
    styleUrl: './lasts-matches.component.scss'
})
export class LastsMatchesComponent {
  matches: MatchResponse[] = [];  
  teamName: string = '';

  private route = inject(Router);
  private dashboardService = inject(DashboardService);
  private guestService = inject(GuestService);
  ngOnInit() {
    this.matches = sessionStorage.getItem('matches') ? JSON.parse(sessionStorage.getItem('matches') || '') : [];
    this.matches.sort((a: MatchResponse, b: MatchResponse) => {return a.numberOfMatchDay - b.numberOfMatchDay;});
    this.teamName = sessionStorage.getItem('teamNameMatches') || '';
    if(this.matches.length>0){sessionStorage.removeItem('matches');}
    if(this.teamName.length>0){sessionStorage.removeItem('teamNameMatches');}

  }
  
    viewEvents(index: number): void {
      
    }

    back(): void {
      this.dashboardService.setActiveDashboardAdminComponent('list-teams');
      this.dashboardService.setActiveTournamentComponent('list-teams-tournament');
      this.guestService.setActiveComponent('list-teams-tournament');
    }


}
