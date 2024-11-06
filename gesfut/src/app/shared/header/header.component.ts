import { Router } from '@angular/router';
import { SessionService } from '../../core/services/manager/session.service';
import { Component } from '@angular/core';
import { UserComponent } from '../../shared/user/user.component';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UserComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']  // Cambiado 'styleUrl' a 'styleUrls'
})
export class HeaderComponent {

  isLoggedIn: boolean = false;
  name: string = '';

  constructor(private sessionService: SessionService, private route: Router, private dashboardService:DashboardService){

  }

  changeComponent(component:string){
    if(component === 'dashboard-principal'){
      component = 'dashboard';
      this.dashboardService.setActiveDashboardAdminComponent(component);
      this.route.navigateByUrl('/admin');
    }
    this.dashboardService.setActiveDashboardAdminComponent(component);
    this.dashboardService.setActiveTournamentComponent(component);
  }


  routeActive():boolean{
    let flag : boolean = false;
    if(this.route.url.includes('tournaments')){
      flag = true;
    }
    return flag;
  }


  ngOnInit(): void {
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
