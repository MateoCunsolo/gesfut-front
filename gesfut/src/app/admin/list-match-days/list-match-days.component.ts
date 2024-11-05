import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class ListMatchDaysComponent implements OnInit {
  tournament: TournamentResponseFull | null = null;
  private subscription: Subscription | null = null;
  selectedMatchDay=0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getTournament("246e0883-99ad-4f7e-a47f-a1c876e288e5").subscribe({
      next: (response) => {
        this.tournament = response;
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
