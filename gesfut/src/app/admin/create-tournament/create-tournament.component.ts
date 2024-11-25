import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';
import { TournamentRequest } from '../../core/models/tournamentRequest';
import { AdminService } from '../../core/services/manager/admin.service';
import { FooterComponent } from "../../shared/footer/footer.component";
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { verify } from 'jsonwebtoken';
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
    private alertService: AlertService,
    private fb: FormBuilder, 
    private router: Router
  ) {
    this.createTournamentForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50),
        Validators.pattern(/^\S(?:.*\S)?$/)
      ]],
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
          this.alertService.successAlert(this.name?.value.toUpperCase() + ' CREADO CORRECTAMENTE');
          this.router.navigate([`/admin/tournaments/${response}`]);
          this.dashboardService.setHaveParticipants(false);
        },
        error: (err) => {
          console.error('Error al crear el torneo:', err);
        }
      });
    } else {
      if (this.createTournamentForm.get('name')?.errors?.['required']) {
        this.alertService.errorAlert('El nombre del torneo es obligatorio');
      } else if (this.createTournamentForm.get('name')?.errors?.['minlength']) {
        this.alertService.errorAlert('El nombre del torneo debe tener al menos 3 caracteres');
      } else if (this.createTournamentForm.get('name')?.errors?.['maxlength']) {
        this.alertService.errorAlert('El nombre del torneo no puede tener más de 50 caracteres');
      } else if (this.createTournamentForm.get('name')?.errors?.['pattern']) {
        this.alertService.errorAlert('El nombre del torneo no puede contener espacios al inicio o al final');
      }
      

      this.createTournamentForm.markAllAsTouched();
    }
  }
    
  changeComponent(component:string){
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }
  
}
