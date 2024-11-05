import { Component } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { routes } from '../../app.routes';
import { Router, RouterModule } from '@angular/router';
import { TouranmentCurrentService } from '../../core/services/tournamentCurrent';

@Component({
  selector: 'app-tournament-dashboard',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './tournament-dashboard.component.html',
  styleUrl: './tournament-dashboard.component.scss'
})
export class TournamentDashboardComponent {

  code:string = '';
  flag:boolean = false;
  name:string = '';
  date:string = '';

  tournament: TournamentResponseFull = {
    name: '',
    code: '',
    startDate: '',
    manager: '',
    isFinished: false,
    participants: [],
    matchDays: []
  };

  constructor(private adminService: AdminService, private router: Router, private tournamentCurrent: TouranmentCurrentService) { }

  ngOnInit() {
    this.code = this.tournamentCurrent.getTournamentCurrent().code;
    this.name = this.tournamentCurrent.getTournamentCurrent().name.toUpperCase();
    this.date = this.tournamentCurrent.getTournamentCurrent().startDate.toString().split('T')[0].split('-').reverse().join('/');

    if (this.code) {
      this.adminService.getTournament(this.code).subscribe({
        next: (response) => {
          console.log('Torneo obtenido:', response)
          this.tournament = response;
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('Obtencion del torneo completado.');
        }
      });
    }
  }

  toInitializeTournament() {
    console.log('Redirigiendo a inicializar torneo');
    console.log('Codigo del torneo:', this.code);
    this.router.navigate(['/admin/tournaments/' + this.code + '/initialize']);
  }

  toBack() {
    this.router.navigate(['/admin']);
  }

}
