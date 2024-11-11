import { Component, HostListener } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';  // Asegúrate de importar CommonModule
import { NgModule } from '@angular/core';


@Component({
  selector: 'app-navbar',
  standalone: true,  
  imports: [CommonModule], 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isMobile: boolean = false;
  menuOpen: boolean = false;

  constructor(private dashboardService: DashboardService) {
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
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
