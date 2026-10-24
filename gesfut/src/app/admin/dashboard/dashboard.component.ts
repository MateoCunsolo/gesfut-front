import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { getLastTournament, forgetLastTournament } from '../../core/utils/last-tournament';
import { FooterComponent } from "../../shared/footer/footer.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { NgIf } from '@angular/common';
import { OnboardingGuideComponent } from '../onboarding-guide/onboarding-guide.component';

@Component({
    selector: 'app-dashboard',
    imports: [OnboardingGuideComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private router = inject(Router);
  lastTournamentClicked: string = '';
  readonly lastTournamentName = signal('');
  /** C(a): oculto hasta que el servidor confirme que el torneo es del usuario. Signal: el componente es OnPush
   *  (con un boolean comun la respuesta asincronica no repintaba y el panel no aparecia nunca). */
  flagIsMyTournament = signal(false);
  constructor() {} 

  ngOnInit() {
    const last = getLastTournament();
    this.lastTournamentClicked = last?.code ?? '';
    if(this.lastTournamentClicked !== '') this.isMyTournament(this.lastTournamentClicked);
  }

  changeComponent(component:string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }

  isMyTournament(code: string) {
    this.tournamentService.isMyTournament(code).subscribe({
      next: (response) => {
        if (response) {
          this.flagIsMyTournament.set(true);
          this.tournamentService.getTournamentShort(code).subscribe({ next: (t) => this.lastTournamentName.set(t?.name ?? ''), error: () => {} });
        }else{
          this.forgetLastTournament();
        }
      },
      // Error de red/servidor: no se muestra, pero tampoco se borra (se reintenta la proxima vez).
      error: () => this.flagIsMyTournament.set(false)
    });
  }

  private forgetLastTournament(): void {
    this.flagIsMyTournament.set(false);
    forgetLastTournament();
  }

  toTournament(code: string) {
    this.tournamentService.tournamentExists(code).subscribe({
      next: (response) => {
        console.log(response);
        if (response) {
          this.router.navigate([`/admin/tournaments/${code}`]);
          this.dashboardService.setNameTournament(this.lastTournamentName());
      }},
      error: (error) => {
        console.log(error);
        this.flagIsMyTournament.set(false);
      }
    });

  }

}
  