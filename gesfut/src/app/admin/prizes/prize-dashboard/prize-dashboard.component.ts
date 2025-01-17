import { Component } from '@angular/core';
import { PrizeService } from '../../../core/services/tournament/prize.service';
import { ListPrizesComponent } from "../list-prizes/list-prizes.component";
import { CreatePrizeComponent } from "../create-prize/create-prize.component";
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-prize-dashboard',
  standalone: true,
  imports: [ListPrizesComponent, CreatePrizeComponent],
  templateUrl: './prize-dashboard.component.html',
  styleUrl: './prize-dashboard.component.scss'
})
export class PrizeDashboardComponent {

  view:string='list';
  currentView:Subscription | null = null;

  constructor(private prizeService:PrizeService){

  }

  ngOnInit() {
    this.currentView = this.prizeService.currentView.subscribe({
      next: (view) => {
        console.log("Nueva vista recibida:", view); // 🔍 Debug
        this.view = view;
      }
    });
  }


  ngOnDestroy() {
    if (this.currentView) {
      this.currentView.unsubscribe();
    }
  }


  setActiveCategory(category:string){
    this.prizeService.currentView.next('list');
    this.prizeService.currentCategory.next(category);
  }

}
