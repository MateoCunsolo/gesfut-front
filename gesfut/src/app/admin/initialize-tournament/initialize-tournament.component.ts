import { Component } from '@angular/core';
import { TeamRequest } from '../../core/models/teamRequest';
import { NavbarComponent } from "../navbar/navbar.component";
import { AdminService } from '../../core/services/manager/admin.service';
import { TeamResponse } from '../../core/models/teamResponse';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { AlertService } from '../../core/services/alert.service';
import { TimepickerDatepickerIntegrationExample } from "../match-day/list-match-days/timePicker/timePicker.component";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-initialize-tournament',
  imports: [FormsModule, TimepickerDatepickerIntegrationExample, NgClass],
  templateUrl: './initialize-tournament.component.html',
  styleUrl: './initialize-tournament.component.scss'
})
export class InitializeTournamentComponent {
  teams: TeamResponse[] = [];
  teamsTournament: TeamResponse[] = [];
  teamsFilters: TeamResponse[] = [];
  code: string = '';
  searchTerm: string = '';
  date: string = '';
  showPicker: boolean = false;
  minutes: number = 0;
  days: number = 0;

  constructor(
    private adminService: AdminService,
    private route: Router,
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private tournamentService: TournamentService,
    private alertService: AlertService
  ) { }



  changeComponent(component: string) {
    this.dashboardService.setActiveTournamentComponent(component);
  }

  addNewTeamToTournament() {
    this.changeComponent('create-team');
  }


  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe({
      next: (param) => {
        if (param.get('code')) {
          this.code = param.get('code')!;
        }
      }
    });

    this.adminService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.map(team => ({
          ...team,
          name: team.name.toUpperCase()
        })).sort((a, b) => a.name.localeCompare(b.name));
        this.teams = this.teams.filter(team => team.status === true);
        this.teamsFilters = [...this.teams];

      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        console.log('TEAMS LOADED');
      }
    });
  }

  cancelPicker(event: Boolean) {
    this.showPicker = false;
  }

  showFormTimePicker() {
    this.showPicker = true;
  }

  filterTeams() {
    this.teams = this.teamsFilters.filter(team =>
      team.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  timeChange(event: String) {
    this.date = (event as string);
  }

  initTournament() {
    if (this.teamsTournament.length >= 4) {
      const ids = this.teamsTournament.map(team => team.id);
      const initializeRequest = {
        tournamentCode: this.code,
        teams: ids,
        startDate: this.date,
        minutesPerMatch: this.minutes,
        dayBetweenMatchDay: this.days
      };
      console.log(initializeRequest);
      this.alertService.loadingAlert('Inicializando torneo...');
      this.adminService.initTournament(initializeRequest).subscribe({
        next: (response) => {
          this.alertService.successAlert('Torneo inicializado');
          setTimeout(() => {
            window.location.reload();
          }, 1000);

        },
        error: (err) => {
          this.alertService.errorAlert(err.error.error);
          console.error(err);
        },
        complete: () => {
          console.log('TOURNAMENT INITIALIZED');
        }
      });
    } else {
      this.alertService.errorAlert('El torneo debe tener al menos 4 equipos');
    }
  }

  addTeam(team: TeamResponse) {
    if (!this.teamsTournament.includes(team)) {
      this.teamsTournament.push(team);
      this.teams = this.teams.filter(t => t !== team);
      this.teamsFilters = this.teamsFilters.filter(t => t !== team);
    } else {
      alert('El equipo ya está en la lista del torneo');
    }
  }

  deleteTeam(team: TeamResponse) {
    this.teamsTournament = this.teamsTournament.filter(t => t !== team);
    this.teamsFilters.push(team);
    this.teams.push(team);
    this.teams.sort((a, b) => a.name.localeCompare(b.name));
  }

  editTeam(team: TeamRequest) {
    throw new Error('Method not implemented.');
  }

  toBack() {
    alert("¿Está seguro de que desea salir? Se perderán los cambios realizados");
    this.route.navigate(['/admin/tournaments/' + this.code]);
  }

  sendMinutesAndDays({ minutes, days }: { minutes: number; days: number; }) {
    this.minutes = minutes;
    this.days = days;
  }

  splitDate(date: string) {
    const dateSplitted = date.split('T');
    const hours = dateSplitted[1].split(':')[0] + ':' + dateSplitted[1].split(':')[1];
    const dateWithStrings = this.dateToString(dateSplitted[0]);
    return { dateWithStrings, hours };
  }

  dateToString(date: string) {
    const dateSplitted = date.split('-');
    const year = dateSplitted[0];
    const month = this.switchToMonth(dateSplitted[1]);
    const day = dateSplitted[2];
    return `${day} de ${month} de ${year}`;
  }

  switchToMonth(month: string): string {
    switch (month) {
      case '01': {
        return 'Enero';
      }
      case '02': {
        return 'Febrero';
      }
      case '03': {
        return 'Marzo';
      }
      case '04': {
        return 'Abril';
      }
      case '05': {
        return 'Mayo';
      }
      case '06': {
        return 'Junio';
      }
      case '07': {
        return 'Julio';
      }
      case '08': {
        return 'Agosto';
      }
      case '09': {
        return 'Septiembre';
      }
      case '10': {
        return 'Octubre';
      }
      case '11': {
        return 'Noviembre';
      }
      case '12': {
        return 'Diciembre';
      }
      default: {
        return 'Invalid month';
      }
    }
  }

  cancelDate() {
    this.date = '';
    this.minutes = 0;
    this.days = 0;
    this.cancelPicker(true);
  }

}