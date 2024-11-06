import { ListTournamentsComponent } from '../../admin/list-tournaments/list-tournaments.component';
import { Component } from '@angular/core';
import { DashboardComponent } from "../../admin/dashboard/dashboard.component";
import { CreateTournamentComponent } from "../../admin/create-tournament/create-tournament.component";
import { CreateTeamComponent } from "../../admin/create-team/create-team.component";
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [DashboardComponent, CreateTournamentComponent, CreateTeamComponent, ListTournamentsComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {

  activeComponent = 'dashboard';

  constructor(private dashboardService: DashboardService) {
    console.log('AdminTournamentPageComponent instanciado');
  }

  ngOnInit() {
    console.log('ngOnInit ejecutado');
    this.dashboardService.activeDashboardAdminComponent$.subscribe((component: string) => {
      this.activeComponent = component;
    });
  }

}
