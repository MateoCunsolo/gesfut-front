import { Router } from '@angular/router';
import { SessionService } from '../../core/services/manager/session.service';
import { Component } from '@angular/core';
import { UserComponent } from '../../shared/user/user.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TeamResponse } from '../../core/models/teamResponse';

@Component({
  selector: 'app-header',
  imports: [UserComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] // Cambiado 'styleUrl' a 'styleUrls'
})
export class HeaderComponent {
  lastTournamentClickedName: string = '';
  isLoggedIn: boolean = false;
  isRouteTorunament: boolean = false;
  name: string = '';
  noIsAdmin: boolean = true;
  guest: boolean = false;
  code: string = '';

  constructor( private tournamentService: TournamentService,private sessionService: SessionService, private route: Router, private activatedRoute: ActivatedRoute, private dashboardService: DashboardService) { }

  changeComponent(component: string) {
    this.tournamentService.setTeamsToInitTournament([]);
    this.tournamentService.setDateToInitTournament({ date: '', days: 0, minutes: 0 });
    const recetTeam = {} as TeamResponse;
    this.tournamentService.setNewTeamToInitTournament(recetTeam)
    if (component === 'dashboard-principal') {
      component = 'dashboard';
      this.dashboardService.setActiveDashboardAdminComponent(component);
      this.isRouteTorunament = false;
      this.route.navigateByUrl('/admin');
      this.lastTournamentClickedName = '';
    }
    this.dashboardService.haveParticipants$.subscribe({
      next: (response: boolean) => {
        if (response) {
          this.dashboardService.setActiveTournamentComponent('recap');
        } else {
          this.dashboardService.setActiveTournamentComponent(component);
        }
      }
    });
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }


  routeActive(): boolean {
    let flag: boolean = false;
    if (this.route.url.includes('tournaments')) {
      flag = true;
    }
    return flag;
  }


  ngOnInit(): void {

    this.route.events.subscribe(() => {
      if (this.route.url.includes('verify-email')) {
        this.guest = false;
      }else{
        const match = this.route.url.match(/\/([^/]+)$/);
        this.code = match ? match[1] : '';
        if (this.code.length > 0) {
          this.guest = true;
        } else {
          this.guest = false;
        }
      }
    });

    if (this.route.url.includes('admin') && !this.route.url.includes('tournaments')) {
      this.isRouteTorunament = false;
      this.noIsAdmin = false;
    } else {
      this.dashboardService.getNameTournament$.subscribe({
        next: (response: string) => {
          this.lastTournamentClickedName = response;
          this.isRouteTorunament = true
        }
      });
    }

    this.sessionService.userLoginOn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
    this.sessionService.userData.subscribe((userData) => {
      this.name = userData.name;
    });

  }

  onLogin(): void {
    this.route.navigateByUrl('/auth/login');
  }
}
