import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    imports: [NgIf],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private router = inject(Router);
  lastTournamentClicked: string = '';
  lastTournamentClickedName: string = '';
  flagIsMyTournament: boolean = true;
  constructor() {} 

  ngOnInit() {
    this.lastTournamentClicked = localStorage.getItem('lastTournamentClicked') || '';
    if (this.lastTournamentClicked === '') {
      this.flagIsMyTournament = false;
      // this.router.navigate(['/admin']);
    }
    this.lastTournamentClickedName = localStorage.getItem('lastTournamentClickedName') || '';
    if (this.lastTournamentClickedName === '') {
      this.flagIsMyTournament = false;
      // this.router.navigate(['/admin']);
    }
    if(this.lastTournamentClicked !== '') this.isMyTournament(this.lastTournamentClicked);
  }

  changeComponent(component:string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }

  isMyTournament(code: string) {
    this.tournamentService.isMyTournament(code).subscribe({
      next: (response) => {
        if (response) {
          this.flagIsMyTournament = true;
        }else{
          this.flagIsMyTournament = false;
          localStorage.removeItem('lastTournamentClicked');
          localStorage.removeItem('lastTournamentClickedName');
          window.location.reload();
          console.log("No es mi torneo");
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  toTournament(code: string) {
    this.tournamentService.tournamentExists(code).subscribe({
      next: (response) => {
        console.log(response);
        if (response) {
          this.router.navigate([`/admin/tournaments/${code}`]);
          this.dashboardService.setNameTournament(this.lastTournamentClickedName);
      }},
      error: (error) => {
        console.log(error);
        this.flagIsMyTournament = false;
      }
    });

  }

}
  