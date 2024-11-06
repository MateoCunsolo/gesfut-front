import { Component } from '@angular/core';
import { AdminService } from '../../core/services/manager/admin.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-tournament-dashboard',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './tournament-dashboard.component.html',
  styleUrl: './tournament-dashboard.component.scss'
})
export class TournamentDashboardComponent {

  code: string | null = null;
  flag:boolean = false;

  tournament: TournamentResponseShort = {
    name: '',
    code: '',
    startDate: '',
    isFinished: false,
    haveParticipants: false,  
  };

  constructor(private adminService: AdminService, private router: Router, private activatedRoute:ActivatedRoute,private dashboardService:DashboardService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe({
      next: (param) => {
        if(param.get('code')){
          this.code = param.get('code');
        }
      }
    })

    if (this.code) {
      this.adminService.getTournamentShort(this.code).subscribe({
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

  changeComponent(component:string){
    this.dashboardService.setActiveTournamentComponent(component);

  } 


  toInitializeTournament() {
    console.log('Redirigiendo a inicializar torneo');
    console.log('Codigo del torneo:', this.code);
    this.router.navigate(['/admin/tournaments/' + this.code + '/initialize']);
  }

}
