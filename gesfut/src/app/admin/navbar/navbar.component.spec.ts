import { Component, HostListener } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { SessionService } from '../../core/services/manager/session.service';
import { GuestService } from '../../core/services/guest/guest.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isMobile: boolean = false;
  menuOpen: boolean = false;

  constructor(private dashboardService: DashboardService, private sessionService:SessionService, private guestService:GuestService) {
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
    let value = this.sessionService.isAuth();
    alert(value);
    alert(this.sessionService.isAuth())
    if(this.sessionService.isAuth()){
      this.dashboardService.setActiveTournamentComponent(component);
    }else{
      this.guestService.setActiveComponent(component);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
