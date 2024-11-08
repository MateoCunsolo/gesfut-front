import { Component } from '@angular/core';
import { ListMatchDaysComponent } from "../list-match-days/list-match-days.component";
import { DashboardService } from '../../../core/services/dashboard.service';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';
import { LoadResultComponent } from "../../load-result/load-result.component";

@Component({
  selector: 'app-match-days',
  standalone: true,
  imports: [ListMatchDaysComponent, LoadResultComponent],
  templateUrl: './match-days.component.html',
  styleUrl: './match-days.component.scss'
})
export class MatchDaysComponent {

  currentComponent:string='list-match-days';

  constructor(
    private dashboardService:DashboardService,
    private matchDayService:MatchDaysService) {
    
  }

  ngOnInit(): void {
    this.matchDayService.currentTournament.subscribe({
      next:(response) => {
        this.currentComponent=response;
      }
    })
  }

}
