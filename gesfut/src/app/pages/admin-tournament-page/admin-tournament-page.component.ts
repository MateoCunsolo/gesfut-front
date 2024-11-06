import { CommonModule } from '@angular/common';
import { AfterViewInit, Component} from '@angular/core';
import { NavbarComponent } from "../../admin/navbar/navbar.component";
import { TournamentDashboardComponent } from "../../admin/tournament-dashboard/tournament-dashboard.component";
import { InitializeTournamentComponent } from "../../admin/initialize-tournament/initialize-tournament.component";
import { ListMatchDaysComponent } from "../../admin/list-match-days/list-match-days.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'app-admin-tournament-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TournamentDashboardComponent, InitializeTournamentComponent, ListMatchDaysComponent],
  templateUrl: './admin-tournament-page.component.html',
  styleUrl: './admin-tournament-page.component.scss'
})
export class AdminTournamentPageComponent implements AfterViewInit {

  activeComponent = '';

  constructor(private dashboardService: DashboardService) {
    console.log('AdminTournamentPageComponent instanciado');
  }

  ngOnInit() {
    console.log('ngOnInit ejecutado');
    this.dashboardService.activeTournamentComponent$.subscribe((component:string)=>{
      this.activeComponent = component;
      console.log('despues de actualizar: ' + this.activeComponent);
    })
  }

  ngAfterViewInit() {
    console.log('ngOnInit ejecutado');
    this.dashboardService.activeTournamentComponent$.subscribe((component:string)=>{
      this.activeComponent = component;
      console.log('despues de actualizar: ' + this.activeComponent);
    })
  }
}

