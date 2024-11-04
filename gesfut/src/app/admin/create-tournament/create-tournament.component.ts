import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';
import { TournamentRequest } from '../../core/models/tournamentRequest';
import { AdminService } from '../../core/services/admin.service';
import { FooterComponent } from "../../shared/footer/footer.component";

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
  code: string = '';

  constructor(
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
      this.adminService.createTournament(tournament).subscribe({
        next: (response) => {
          console.log('Torneo creado:', response)
          this.code = response.code;
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('Creacion del torneo completado.');
          this.router.navigate([`/admin/tournaments/${this.code}`]);
        }
      });
    }
  }

  toBack(){
    this.router.navigate(['/admin']);
  }
  
}
