import { Component } from '@angular/core';
import { PrizeService } from '../../../core/services/tournament/prize.service';
import { ListPrizesComponent } from "../list-prizes/list-prizes.component";
import { CreatePrizeComponent } from "../create-prize/create-prize.component";
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-prize-dashboard',
    imports: [ListPrizesComponent, CreatePrizeComponent],
    templateUrl: './prize-dashboard.component.html',
    styleUrl: './prize-dashboard.component.scss'
})
export class PrizeDashboardComponent {

  activeCategory = 'POSITION';
  view:string='list';
  currentView:Subscription | null = null;
  categorySubscription:Subscription | null = null;

  constructor(private prizeService:PrizeService){

  }

  ngOnInit() {
    this.categorySubscription = this.prizeService.currentCategory.subscribe(category => this.activeCategory = category);
    this.currentView = this.prizeService.currentView.subscribe({
      next: (view) => {
        this.view = view;
      }
    });
  }


  ngOnDestroy() {
    this.categorySubscription?.unsubscribe();
    if (this.currentView) {
      this.currentView.unsubscribe();
    }
  }


  setActiveCategory(category:string){
    this.activeCategory = category;
    this.prizeService.currentView.next('list');
    this.prizeService.currentCategory.next(category);
  }

}
