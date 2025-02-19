import { Component, HostListener } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent {

  isMobile: boolean = false;
  menuOpen: boolean = false;
tournamentName: any;

  constructor(private dashboardService: DashboardService) {
    // Inicializamos la detección de pantalla móvil
    this.checkScreenSize();
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
}
