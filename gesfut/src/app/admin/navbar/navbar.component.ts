import { currentTournamentCode } from '../../core/utils/route-code';
import { TournamentNavComponent } from '../../shared/tournament-nav/tournament-nav.component';
import { Component, HostListener } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';  // Asegúrate de importar CommonModule
import { NgModule } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service';


@Component({
    selector: 'app-navbar',
    imports: [CommonModule, TournamentNavComponent],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isMobile: boolean = false;
  menuOpen: boolean = false;
  activeComponent = 'recap';
  tournamentName: string = '';
  /** Codigo del torneo de la URL (/admin/tournaments/:code), no del estado en memoria. */
  get shareCode(): string | null { return currentTournamentCode(); }
  constructor(private dashboardService: DashboardService, private sessionService:SessionService) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.dashboardService.activeTournamentComponent$.subscribe(value => this.activeComponent = value);
    this.dashboardService.getNameTournament$.subscribe({
      next: (response: string) => {
        this.tournamentName = response;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  changeComponent(component: string) {
    this.dashboardService.setActiveTournamentComponent(component);
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isAuth():boolean{
    return this.sessionService.isAuth();
  }
}
