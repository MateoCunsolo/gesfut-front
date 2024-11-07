import { Router } from '@angular/router';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Output} from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';

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
  private tournamentService = inject(TournamentService);

  listTournaments: TournamentResponseShort [] = [];


  constructor() {} 

  changeComponent(component:string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }

  ngOnInit() {
    this.tournamentService.getTournamentShortList().subscribe({
      next: (response) => {
        this.listTournaments = response;
      }
    })
  }


}
  