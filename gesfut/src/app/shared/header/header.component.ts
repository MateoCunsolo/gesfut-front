import { Router } from '@angular/router';
import { SessionService } from '../../core/services/manager/session.service';
import { Component } from '@angular/core';
import { UserComponent } from '../../shared/user/user.component';
import { DashboardService } from '../../core/services/dashboard.service';

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
  constructor(private sessionService: SessionService, private route: Router, private dashboardService:DashboardService){

  }

  changeComponent(component:string){
    if(component === 'dashboard-principal'){
      component = 'dashboard';
      this.dashboardService.setActiveDashboardAdminComponent(component);
      this.isRouteTorunament = false;
      this.route.navigateByUrl('/admin');
      this.lastTournamentClickedName = '';
    }
    this.dashboardService.haveParticipants$.subscribe({
      next: (response: boolean) => {
        if(response){
          this.dashboardService.setActiveTournamentComponent('recap');
        }else{
          this.dashboardService.setActiveTournamentComponent(component);
        }
      }
    });
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }


  routeActive():boolean{
    let flag : boolean = false;
    if(this.route.url.includes('tournaments')){
      flag = true;
    }
    return flag;
  }

  
  ngOnInit(): void {
    
    if(this.route.url.includes('admin') && !this.route.url.includes('tournaments')){
      this.isRouteTorunament = false;
      this.noIsAdmin = false;
    }else{
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
