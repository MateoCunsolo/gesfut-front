import { Component, HostListener } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';  // Asegúrate de importar CommonModule
import { NgModule } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service';


@Component({
    selector: 'app-navbar',
    imports: [CommonModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isMobile: boolean = false;
  menuOpen: boolean = false;

  constructor(private dashboardService: DashboardService, private sessionService:SessionService) {
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

  isAuth():boolean{
    return this.sessionService.isAuth();
  }
}
