import { DashboardComponent } from './../dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../core/services/manager/admin.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';


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
    private adminService: AdminService, 
    private routeActive: ActivatedRoute,
    private dashboardService:DashboardService
  ) {}

  ngOnInit(): void {
    this.routeActive.paramMap.subscribe({
      next: (paramMap) => {
        this.code = paramMap.get('code');
      }
    });
    
    this.subscription = this.adminService.getTournament(this.code).subscribe({
      next: (response) => {
        this.tournament = response;
        this.sortMatchDays();
      }
    });
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
