import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  isMenuOpen = false;
  name: string = '';
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

  onLogout(): void {
    this.sessionService.clearUserSession();
    this.route.navigateByUrl('/');
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
        'ELIGUE QUE QUIERES HACER',
        'PREGUNTAS FRECUENTES',
        'ENVIAR CORREO'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.route.navigateByUrl('/admin/faq');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.alertService.infoAlert('gesfut.arg@gmail.com', 'Porfavor detalla correctamente el problema y si puedes envia fotos. Gracias por tu colaboración');
        }else{
          this.alertService.infoAlertTop('No se ha seleccionado ninguna opción');
          this.route.navigateByUrl('/admin');
        }
      });
  }
}
