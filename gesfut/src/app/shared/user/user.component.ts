import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import Swal from 'sweetalert2';
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
        } else {
          this.alertService.infoAlertTop('No se ha seleccionado ninguna opción');
          this.route.navigateByUrl('/admin');
        }
      });
  }

  generateLink() {
    this.alertService.saherdLinkAlert('LINK DEL TORNEO', 'http://localhost:4200/' + this.code).
      then((result) => {
        if (result.isConfirmed) {
          this.alertService.loadingAlert('Copiando link al portapapeles...');
          navigator.clipboard.writeText('http://localhost:4200/' + this.code).then(() => {
            this.alertService.infoAlertTop('Link copiado al portapapeles');
          });
        }
      });
  }
}
