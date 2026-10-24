import { currentTournamentCode } from '../../core/utils/route-code';
import { shareTournament } from '../../core/utils/share-tournament';
import { Component, HostListener, inject } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  isMenuOpen = false;
  name: string = '';
  /** Se evalua al abrir el menu (antes dependia de un NavigationEnd que a veces ya habia pasado). */
  get inTournament(): boolean { return /\/admin\/tournaments\/[0-9a-fA-F-]{36}/.test(window.location.pathname); }

  private alertService = inject(AlertService);
  constructor(private sessionService: SessionService, private route: Router) {
    this.sessionService.userData.subscribe((data) => {
      this.name = data.name;
    });
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toChangePasswordWithPassword() {
    this.route.navigateByUrl('/admin/change-password');
  }

  async onLogout(): Promise<void> {
    // El guard del editor puede cancelar la salida; conservar la sesión en ese caso.
    this.sessionService.loggingOut = true;
    try {
      if (await this.route.navigateByUrl('/')) {
        await this.sessionService.revokeToken();
        this.sessionService.clearUserSession();
      }
    } finally {
      this.sessionService.loggingOut = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-container') && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  help() {
    this.alertService
      .twoOptionsAlert(
        'AYUDA',
        'Elegí qué querés hacer',
        'PREGUNTAS FRECUENTES',
        'ENVIAR CORREO'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.route.navigateByUrl('/admin/faq');
        } else if (String(result.dismiss) === 'cancel' /* Swal.DismissReason.cancel, sin importar sweetalert2 en el bundle inicial */) {
          this.alertService.infoAlert('gesfut.arg@gmail.com', 'Por favor, detallá el problema y, si podés, enviá capturas. Gracias por tu colaboración.');
        } else {
          this.alertService.infoAlertTop('No elegiste ninguna opción.');
          this.route.navigateByUrl('/admin');
        }
      });
  }

  async generateLink() {
    // El codigo sale de la URL: el estado en memoria podia estar vacio y el link quedaba en "/".
    await shareTournament(currentTournamentCode(), this.alertService);
  }
  
}
