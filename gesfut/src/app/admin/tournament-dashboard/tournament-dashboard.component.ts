import { Component } from '@angular/core';
import { AdminService } from '../../core/services/manager/admin.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';

@Component({
  selector: 'app-tournament-dashboard',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './tournament-dashboard.component.html',
  styleUrl: './tournament-dashboard.component.scss'
})
export class TournamentDashboardComponent {

  code: string = '';
  flag:boolean = false;

  tournamentFull: TournamentResponseFull = INITIAL_TOURNAMENT;

  tournamentShort: TournamentResponseShort = {
    name: '',
    code: '' ,
    startDate: '',
    isFinished: false,
    haveParticipants: false,  
  };

  constructor(
    private adminService: AdminService, 
    private router: Router, 
    private activatedRoute:ActivatedRoute,
    private dashboardService:DashboardService,
    private tournamentService:TournamentService
  ) { }

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe({
      next: (param) => {
        if(param.get('code')){
          this.code = param.get('code')!;
        }
      }
    })

    this.adminService.getTournamentShort(this.code).subscribe({
      next: (response)=>{
          this.tournamentShort = response;
          if(response.haveParticipants){
            this.dashboardService.setHaveParticipants(true);
          }
      }
    });
    


    if (this.code) {
      this.tournamentService.getTournamentFull(this.code).subscribe({
        next: (response:TournamentResponseFull) => {
          console.log('Torneo obtenido:', response)
          this.tournamentFull = response;
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




  changeComponent(component:string){
    this.dashboardService.setActiveTournamentComponent(component);
  } 


  toInitializeTournament() {
    console.log('Redirigiendo a inicializar torneo');
    console.log('Codigo del torneo:', this.code);
    this.router.navigate(['/admin/tournaments/' + this.code + '/initialize']);
  }

}
