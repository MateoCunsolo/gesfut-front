import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';


@Component({
  selector: 'app-list-match-days',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-match-days.component.html',
  styleUrls: ['./list-match-days.component.scss']
})
export class ListMatchDaysComponent implements OnInit, OnDestroy {
  tournament: TournamentResponseFull | null = null;
  private subscription: Subscription | null = null;
  selectedMatchDay = 0;
  code: string | null = null;
  constructor(
    private dashboardService:DashboardService,
    private tournamentService:TournamentService
  ) {}

  ngOnInit(): void {
    this.tournamentService.currentTournament.subscribe({
      next: (response:TournamentResponseFull) =>{
        this.tournament = response;
        this.sortMatchDays();
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
}
