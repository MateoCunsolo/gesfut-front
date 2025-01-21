import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrizeService } from '../../../core/services/tournament/prize.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Prize } from '../../../core/models/prizesRequest';
import { AlertService } from '../../../core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-prizes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-prizes.component.html',
  styleUrls: ['./list-prizes.component.scss'],
})
export class ListPrizesComponent implements OnInit, OnDestroy {
  currentCategory: string = '';
  prizes: Prize[] = [];
  categorySubscription: Subscription | undefined;
  currentTournament: string | null = localStorage.getItem(
    'lastTournamentClicked'
  );

  constructor(
    private prizeService: PrizeService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.categorySubscription = this.prizeService.currentCategory.subscribe(
      (newCategory: string) => {
        this.currentCategory = newCategory;
        this.getPrizes();
      }
    );
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  getPrizes() {
    if (this.currentTournament)
      this.prizeService
        .getAllPrizesByCategory(this.currentTournament, this.currentCategory)
        .subscribe({
          next: (response: Prize[]) => {
            console.log(this.currentCategory);
            this.prizes = response;
          },
        });
  }

  expandedIndex: number | null = null;

  toggleAccordion(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  setView(view: string) {
    console.log('Cambiando vista a:', view);
    this.prizeService.currentView.next(view);
  }

  async deletePrize(position: number) {
    this.alertService
      .confirmAlert(
        '¿Desea eliminar el premio?',
        'Confirma para eliminar.',
        'Confirmar'
      )
      .then((result) => {
        if (result.isConfirmed && this.currentTournament)
          this.prizeService
            .deletePrize(this.currentTournament, this.currentCategory, position)
            .subscribe({
              next: () => {
                this.prizes = this.prizes.filter(
                  (prize) => prize.position !== position
                );
              },
              error: (err: HttpErrorResponse) => {
                console.log(err);
                this.alertService.errorAlert(err.error.error);
              },
            });
      });
  }
}
