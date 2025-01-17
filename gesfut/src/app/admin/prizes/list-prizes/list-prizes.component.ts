import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrizeService } from '../../../core/services/tournament/prize.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Prize } from '../../../core/models/prizesRequest';
import { TournamentService } from '../../../core/services/tournament/tournament.service';
import { TournamentResponseShort } from '../../../core/models/tournamentResponseShort';

@Component({
  selector: 'app-list-prizes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-prizes.component.html',
  styleUrls: ['./list-prizes.component.scss']
})
export class ListPrizesComponent implements OnInit, OnDestroy {

  currentCategory: string = "";
  prizes:Prize[] = [];
  categorySubscription: Subscription | undefined;
  currentTournament: string | null = localStorage.getItem("lastTournamentClicked");


  constructor(private prizeService: PrizeService) {}

  ngOnInit() {
    this.categorySubscription = this.prizeService.currentCategory
      .subscribe((newCategory: string) => {
        this.currentCategory = newCategory;
        this.getPrizes();
      });
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  getPrizes(){
    if(this.currentTournament)
    this.prizeService.getAllPrizesByCategory(this.currentTournament, this.currentCategory).subscribe({
      next: (response:Prize[]) => {
        console.log(this.currentCategory)
        this.prizes = response;
      }
    })
  }

  expandedIndex: number | null = null;

  toggleAccordion(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  setView(view:string){
    this.prizeService.currentView.next(view);
  }
}
