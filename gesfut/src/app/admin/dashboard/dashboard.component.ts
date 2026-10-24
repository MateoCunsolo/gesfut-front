import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { getLastTournament, forgetLastTournament } from '../../core/utils/last-tournament';
import { FooterComponent } from "../../shared/footer/footer.component";
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { NgIf } from '@angular/common';
import { OnboardingGuideComponent } from '../onboarding-guide/onboarding-guide.component';
import { OwnedNameGate } from '../../core/utils/owned-name';

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
    // Lote 24/10 (d): el nombre se pide EN PARALELO con la verificacion de propiedad (antes era encadenado);
    // solo se muestra cuando el servidor confirma que el torneo es del usuario.
    // Review 24/10 (privacidad): el nombre solo se publica cuando la propiedad esta confirmada.
    const gate = new OwnedNameGate((n) => this.lastTournamentName.set(n));
    this.tournamentService.getTournamentShort(code).subscribe({ next: (t) => gate.name(t?.name), error: () => {} });
    this.tournamentService.isMyTournament(code).subscribe({
      next: (response) => {
        gate.ownership(!!response);
        if (response) {
          this.flagIsMyTournament.set(true);
        }else{
          this.forgetLastTournament();
        }
      },
      // Error de red/servidor: no se muestra, pero tampoco se borra (se reintenta la proxima vez).
      error: () => { gate.ownership(false); this.flagIsMyTournament.set(false); }
    });
  }

  private forgetLastTournament(): void {
    this.flagIsMyTournament.set(false);
    forgetLastTournament();
  }

  toTournament(code: string) {
    this.tournamentService.tournamentExists(code).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate([`/admin/tournaments/${code}`]);
          this.dashboardService.setNameTournament(this.lastTournamentName());
      }},
      error: () => {
        this.flagIsMyTournament.set(false);
      }
    });

  }

}
  