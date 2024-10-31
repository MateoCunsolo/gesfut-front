import { PlayerRequest, TeamRequest } from './../../core/models/teamRequest';
import { MatButtonModule } from '@angular/material/button';

import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../core/services/team.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';

const materialModules = [
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatButtonModule,
  MatError,
  MatIconModule,
  MatCardModule,
  MatCheckboxModule,
  CommonModule,
  MatTableModule
];

@Component({
  selector: 'app-create-team',
  standalone: true,
  imports: [materialModules, ReactiveFormsModule],
  templateUrl: './create-team.component.html',
  styleUrl: './create-team.component.scss'
})
export class CreateTeamComponent {
  error:String='';
  teamForm: FormGroup;
  displayedColumns: string[] = ['name', 'lastName', 'number', 'isCaptain', 'isGoalKeeper', 'remove'];

  constructor(private fb: FormBuilder, private teamService:TeamService) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required],
      players: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    for(let i = 0; i<6; i++){
      this.addPlayer();
    }
  }
  get players() {
    return this.teamForm.get('players') as FormArray;
  }

  addPlayer() {
    const playerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      number: ['', Validators.required],
      isCaptain: [false],
      isGoalKeeper: [false],
    });
    this.players.push(playerForm);
  }

  removePlayer(index: number) {
    this.players.removeAt(index);
  }

  onSubmit() {
    const teamData = this.teamForm.value; // Obtenemos los datos del formulario
    const players: PlayerRequest[] = teamData.players.map((player: PlayerRequest) => ({
      name: player.name,
      lastName: player.lastName,
      number: player.number,
      isCaptain: player.isCaptain,
      isGoalKeeper: player.isGoalKeeper,
    }));
  
    const teamRequest:TeamRequest = {
      name : teamData.name,
      color : teamData.color,
      players: players
    }

    this.teamService.createTeam(teamRequest).subscribe({
      next: () => {
        this.error = '';
        alert("Equipo creado exitosamente!");
      },
      error: (err:HttpErrorResponse) => {
        console.log(err)
        this.error = err.error.error;
      }
    })
  }


}
