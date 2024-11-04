import { TournamentCodeService } from './../../core/services/tournament-code.service';
import { Component } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { routes } from '../../app.routes';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-tournament-dashboard',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './tournament-dashboard.component.html',
  styleUrl: './tournament-dashboard.component.scss'
})
export class TournamentDashboardComponent {
  title = 'Tournament Dashboard';
  code = '';
  flag = false;
  tournament: TournamentResponseFull = {
    name: '',
    code: '',
    startDate: '',
    manager: '',
    isFinished: false,
    participants: [],
    matchDays: []
  };

  constructor(private adminService: AdminService, private router: Router, private tournamentCodeService:TournamentCodeService){}

  ngOnInit() {
    this.code=this.tournamentCodeService.getTournamentCode();
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

  toInitializeTournament() {
    console.log('Redirigiendo a inicializar torneo');
    console.log('Codigo del torneo:', this.code);
    this.router.navigate(['/admin/tournaments/' + this.code + '/initialize']);
  }

}
