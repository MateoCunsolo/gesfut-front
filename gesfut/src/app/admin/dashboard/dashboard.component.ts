import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {

  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  lastTournamentClicked: string = '';
  lastTournamentClickedName: string = '';
  constructor() {} 

  ngOnInit() {
    this.lastTournamentClicked = localStorage.getItem('lastTournamentClicked') || '';
    this.lastTournamentClickedName = localStorage.getItem('lastTournamentClickedName') || '';

  }

  changeComponent(component:string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }

  toTournament(code: string) {
    localStorage.setItem('lastTournamentClicked', code);
    this.router.navigate([`/admin/tournaments/${code}`]);
    this.dashboardService.setNameTournament(this.lastTournamentClickedName);
  }

}
  