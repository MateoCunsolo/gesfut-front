import { Component } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  constructor(private dashboardService:DashboardService){

  }

  changeComponent(component:string){
    this.dashboardService.setActiveTournamentComponent(component);

  }


}