import { ListTournamentsComponent } from './../list-tournaments/list-tournaments.component';
import { Component, ViewChild } from '@angular/core';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { CreateTournamentComponent } from "../create-tournament/create-tournament.component";
import { CreateTeamComponent } from "../create-team/create-team.component";

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [DashboardComponent, CreateTournamentComponent, CreateTeamComponent, ListTournamentsComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {

  activeComponent = 'dashboard';

  // Accedemos al componente hijo `DashboardComponent`
  @ViewChild(DashboardComponent) dashboardComponent!: DashboardComponent;
  @ViewChild(CreateTournamentComponent) createTournamentComponent!: CreateTournamentComponent;
  @ViewChild(ListTournamentsComponent) listTournamentsComponent!:ListTournamentsComponent;
  ngAfterViewInit() {
    // Suscribirse al `@Output` del `DashboardComponent`
    this.dashboardComponent.activeComponent.subscribe((component: string) => {
      this.activeComponent = component; // Actualizamos `activeComponent` en el padre
    });
    this.createTournamentComponent.activeComponent.subscribe((component: string) => {
      this.activeComponent = component; // Actualizamos `activeComponent` en el padre
    });
    this.listTournamentsComponent.activeComponent.subscribe((component: string) => {
      this.activeComponent = component; // Actualizamos `activeComponent` en el padre
    });
  }

}
