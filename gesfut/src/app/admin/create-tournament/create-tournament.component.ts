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
  imports: [ReactiveFormsModule],
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
    private router: Router
  ) {
    this.createTournamentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    });
  }

  get name() {
    return this.createTournamentForm.get('name');
  }

  onSubmit() {
    if (this.createTournamentForm.valid) {
      const tournament: TournamentRequest = { name: this.name?.value };
      console.log("torneo antes del llamado: " + tournament);
      this.adminService.createTournament(tournament).subscribe({
        next: (response) => {
          localStorage.setItem('lastTournamentClicked', response.toString());
          localStorage.setItem('lastTournamentClickedName', this.name?.value);
          this.router.navigate([`/admin/tournaments/${response}`]);
          this.dashboardService.setHaveParticipants(false);
        },
        error: (err) => {
          console.error('Error al crear el torneo:', err);
        }
      });
    } else {
      this.createTournamentForm.markAllAsTouched();
    }
  }
    
  changeComponent(component:string){
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }
  
}
