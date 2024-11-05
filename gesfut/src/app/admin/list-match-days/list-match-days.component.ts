import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../core/services/manager/admin.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';


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

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.subscription = this.adminService.getTournament("be3a2687-5291-4617-bb1a-ed03406bc2fd").subscribe({
      next: (response) => {
        this.tournament = response;
        this.sortMatchDays(); // Llama a la función para ordenar matchDays
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
}
