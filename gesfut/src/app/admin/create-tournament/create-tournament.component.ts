import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';
import { TournamentRequest } from '../../core/models/tournamentRequest';
import { AdminService } from '../../core/services/manager/admin.service';
import { FooterComponent } from "../../shared/footer/footer.component";
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-create-tournament',
  standalone: true,
  imports: [ReactiveFormsModule, FooterComponent],
  templateUrl: './create-tournament.component.html',
  styleUrl: './create-tournament.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateTournamentComponent {

  createTournamentForm: FormGroup;
  constructor(
    private dashboardService: DashboardService,
    private adminService: AdminService,
    private fb: FormBuilder, 
    private router:Router) {
    this.createTournamentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit() {
    if (this.createTournamentForm.valid) {
      let tournament: TournamentRequest = { name: this.createTournamentForm.value.name };
      console.log("torneo antes del llamado: " + tournament);
      this.adminService.createTournament(tournament).subscribe({
        next: (response) => {
          console.log('Creacion del torneo completado.');
          console.log("torneo response: " + response);
          this.router.navigate([`/admin/tournaments/${response}`]);
          this.dashboardService.setHaveParticipants(false);
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }

    
  changeComponent(component:string){
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }



}
