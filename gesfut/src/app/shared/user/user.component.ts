import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  isMenuOpen = false;
  name: string = '';
  code: string = '';
  isTournament = false;
  private routerSubscription!: Subscription;
  containsTournaments: boolean = false;

  private alertService = inject(AlertService);
  constructor(private sessionService: SessionService, private route: Router, private tournamentService: TournamentService,private activatedRoute: ActivatedRoute) {
    this.sessionService.userData.subscribe((data) => {
      this.name = data.name;
    });
  }


  ngOnInit(): void {
    this.routerSubscription = this.route.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkUrl(event.urlAfterRedirects);
      });
  }

  checkUrl(url: string): void {
    this.containsTournaments = url.includes('tournaments');
    if (this.containsTournaments) {
      this.isTournament = true;
      this.tournamentService.currentTournament.subscribe({
        next: (response) => {
          this.code = response.code;
        }
      })
    } else {
      this.isTournament = false;
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toChangePasswordWithPassword() {
    this.route.navigateByUrl('/admin/change-password');
  }

  async onLogout(): Promise<void> {
    // El guard del editor puede cancelar la salida; conservar la sesiÃ³n en ese caso.
    if (await this.route.navigateByUrl('/')) {
      this.sessionService.clearUserSession();
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
        'ELIGUE QUE QUIERES HACER',
        'PREGUNTAS FRECUENTES',
        'ENVIAR CORREO'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.route.navigateByUrl('/admin/faq');
        } else if (String(result.dismiss) === 'cancel' /* Swal.DismissReason.cancel, sin importar sweetalert2 en el bundle inicial */) {
          this.alertService.infoAlert('gesfut.arg@gmail.com', 'Porfavor detalla correctamente el problema y si puedes envia fotos. Gracias por tu colaboraciÃ³n');
        } else {
          this.alertService.infoAlertTop('No se ha seleccionado ninguna opciÃ³n');
          this.route.navigateByUrl('/admin');
        }
      });
  }

  async generateLink() {
    const link = new URL(`/${encodeURIComponent(this.code)}`, window.location.origin).href;
    
    try {
      const result = await this.alertService.saherdLinkAlert('LINK DEL TORNEO', link);
      
      if (result.isConfirmed) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link);
          this.alertService.successAlert('Link copiado al portapapeles');
        } else {
          this.copyToClipboardFallback(link);
        }
      }
    } catch (error) {
      console.error('Error al copiar el enlace', error);
      this.copyToClipboardFallback(link);
    }
  }
  
  copyToClipboardFallback(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.alertService.successAlert('Link copiado al portapapeles');
  }
  
}
