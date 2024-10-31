import { Component } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';

@Component({
  selector: 'app-tournament-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './tournament-dashboard.component.html',
  styleUrl: './tournament-dashboard.component.scss'
})
export class TournamentDashboardComponent {
  title = 'Tournament Dashboard';

  tournament: TournamentResponseFull = {
    name: '',
    code: '',
    startDate: '',
    manager: '',
    isFinished: false,
    participants: [],
    matchDays: []
  }; 

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {
    //obtener codigo de la url
    const url = window.location.href;
    let code = url.split('/').pop() || '';    
  
    this.adminService.getTournament(code).subscribe({
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
