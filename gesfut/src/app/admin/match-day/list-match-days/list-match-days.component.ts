import { MatchResponse } from '../../../core/models/tournamentResponse';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TournamentResponseFull } from '../../../core/models/tournamentResponse';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../../core/services/tournament/initial-tournament';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';


@Component({
  selector: 'app-list-match-days',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-match-days.component.html',
  styleUrls: ['./list-match-days.component.scss']
})
export class ListMatchDaysComponent implements OnInit{
  tournament: TournamentResponseFull = INITIAL_TOURNAMENT;


  selectedMatchDay = 0;
  code: string | null = null;
  constructor(
    private dashboardService:DashboardService,
    private tournamentService:TournamentService,
    private matchDaysService:MatchDaysService
  ) {}

  ngOnInit(): void {
    this.tournamentService.currentTournament.subscribe({
      next: (response:TournamentResponseFull) =>{
        this.tournament = response;
        this.sortMatchDays();
      }
    })
  }

  updateMatchDay(matchDay: number) {
    this.selectedMatchDay = matchDay;
  }

  private sortMatchDays(): void {
    if (this.tournament?.matchDays) {
      this.tournament.matchDays.sort((a, b) => a.numberOfMatchDay - b.numberOfMatchDay);
    }
  }

  changeComponent(component:string){
    this.dashboardService.setActiveTournamentComponent(component);
  }

  loadResult(matchId: number) {
    this.matchDaysService.setActiveMatch(matchId);
    this.dashboardService.setActiveTournamentComponent('load-result');
  }

  closeMatchDay(status:boolean){
    console.log(this.tournament.matchDays[this.selectedMatchDay].idMatchDay);
    this.matchDaysService.closeMatchDay(this.tournament.matchDays[this.selectedMatchDay].idMatchDay, status).subscribe({
      error:(error) => {
        console.log(error);
      }
    });
  }

  editResult(id: number) {
    this.matchDaysService.setEditResult(true);
    this.matchDaysService.setActiveMatch(id);
    this.dashboardService.setActiveTournamentComponent('load-result');
  }
}
