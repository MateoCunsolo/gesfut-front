import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/manager/admin.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { NamesTournamentsComponent } from './components/names-tournaments/names-tournaments.component';
import { PlayersComponent } from './components/players/players.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { NgClass } from '@angular/common';
import { AddPlayerComponent } from "./components/players/add-player/add-player.component";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-names-teams',
    imports: [NamesTournamentsComponent, PlayersComponent, NgClass, FormsModule],
    templateUrl: './names-teams.component.html',
    styleUrl: './names-teams.component.scss'
})
export class NamesTeamsComponent implements OnInit {
  public selectedParticipantId: number | null = null;
  protected idSelected: number = 0;
  protected nameClicked: string = '';
  protected nameTouranemt: string = '';
  private adminService = inject(AdminService);
  private dashBoardService = inject(DashboardService);
  protected teamsGlobales: TeamResponse[] = [];
  protected teamsGlobalesInputFilter: TeamResponse[] = []
  protected inputText: string = '';
  protected indexSelectedBefore: number = 0;
  protected indexSelectedAfter: number = 0;
  protected thereAreNotTeams: boolean = false;
  protected isGlobalTeams: boolean = false;
  protected codeTouranment: string = '';
  protected colorSelected: string = '';
  bindingSelect : number = 0;
  clickedToOcultPlayers: boolean = false;
  constructor() {}

  ngOnInit() {
    this.adminService.getTeams().subscribe((response) => {
      this.teamsGlobales = response;
      this.teamsGlobalesInputFilter = response;
      if (this.teamsGlobales.length > 0) {
        this.idSelected = this.teamsGlobales[0].id;
        this.bindingSelect = this.idSelected;
        this.nameClicked = this.teamsGlobales[0].name;
      }else{
        this.thereAreNotTeams = true;
      }
    });
  }

  onOnlyGlobalTeams(event: boolean) {
    this.isGlobalTeams = event;
  }

  showFromOptional(idEvent: Event) {
    let id = (idEvent.target as HTMLInputElement).value;
    if (parseInt(id) != 0) {
      this.showParticipants(parseInt(id));
    }else{
      this.showParticipants(this.idSelected);
    }
  }


  showParticipants(id: number) {
    if ( id != this.idSelected){
      this.clickedToOcultPlayers = false;
    }
    this.idSelected = id;
    this.nameClicked = this.teamsGlobales.find((team) => team.id === id)?.name || '';
    this.indexSelectedAfter = this.teamsGlobalesInputFilter.findIndex((team) => team.id === id);
    this.bindingSelect = this.idSelected;
    this.colorSelected = this.teamsGlobales[this.indexSelectedAfter].color;
    console.log('ID de equipo seleccionado:', this.idSelected, 'index:', this.indexSelectedAfter);
  }

  onParticipantSelected(id: number) {
    this.selectedParticipantId = id;
  }

  onGlobalPlayerSelected(id: number) {
    this.selectedParticipantId = id;
  }
  

  searchTeams($event: Event) {
    this.inputText = ($event.target as HTMLInputElement).value;
    if (this.inputText === '') {
      this.teamsGlobalesInputFilter = this.teamsGlobales;
      this.indexSelectedAfter = this.teamsGlobales.findIndex((team) => team.id === this.idSelected);
    } else {
      this.teamsGlobalesInputFilter = this.teamsGlobales.filter((team) =>
        team.name.toLowerCase().includes(this.inputText.toLowerCase())
      );
      const teamInFilteredList = this.teamsGlobalesInputFilter.find((team) => team.id === this.idSelected);
      if (teamInFilteredList) {
        this.indexSelectedAfter = this.teamsGlobalesInputFilter.findIndex((team) => team.id === this.idSelected);
      } else {
        this.indexSelectedAfter = -1;
      }
    }
  }
  
  onCodeTournament(code: string) {
    this.codeTouranment = code;
    this.clickedToOcultPlayers = true;
  }

  onNameTournament(name: string) {
    this.nameTouranemt = name;
  }

  toDashboard(option:number) {
    switch (option) {
      case 1:
        this.dashBoardService.setActiveDashboardAdminComponent('dashboard');
        break;
      case 2:
        this.dashBoardService.setActiveDashboardAdminComponent('create-team');
        break;
    }
  }

}
