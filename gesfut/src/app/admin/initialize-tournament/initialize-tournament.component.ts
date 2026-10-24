import { httpErrorMessage } from '../../core/utils/http-error';
import { naturalCompare } from '../../core/utils/natural-sort';
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


@Component({
  selector: 'app-initialize-tournament',
  imports: [FormsModule, TimepickerDatepickerIntegrationExample],
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
  name = '';
  constructor(
    private adminService: AdminService,
    private route: Router,
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private tournamentService: TournamentService,
    private alertService: AlertService
  ) { }



  changeComponent(component: string) {
    this.tournamentService.setNewTeamToInitTournament({} as TeamResponse);
    this.dashboardService.setActiveTournamentComponent(component);
  }

  addNewTeamToTournament() {
    this.changeComponent('create-team');
  }


  ngOnInit(): void {


    this.tournamentService.$currentTeamsToInitTournament.subscribe({
      next: (response) => {
        this.teamsTournament = response;
      }
    });

    this.tournamentService.$recentDate.subscribe({
      next: (response) => {
        if (response.days !== 0 && response.minutes !== 0) {
          this.date = response.date;
          this.days = response.days;
          this.minutes = response.minutes;
        }
      }
    });

    this.activatedRoute.paramMap.subscribe({
      next: (param) => {
        if (param.get('code')) {
          this.code = param.get('code')!;
          // Loop 2: el nombre sale del torneo de la URL, no del último torneo clickeado.
          this.tournamentService.getTournamentShort(this.code).subscribe({ next: (t) => { if (t?.name) this.name = t.name; } });
        }
      }
    });

    this.adminService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.map(team => ({
          ...team,
          name: team.name.toUpperCase()
        })).sort((a, b) => naturalCompare(a.name, b.name));
        this.teams = this.teams.filter(team => team.status === true);
        this.teamsFilters = [...this.teams];
        this.getTeamRecentlyCreated();
        this.restoreSelection();
        this.filterTeamsTournament();
      },
      error: (err) => {
      },
      complete: () => {
      }
    });
  }

  getTeamRecentlyCreated() {
    this.tournamentService.$recentlyTeamCreated.subscribe({
      next: (response) => {
        if (response) {
          let team = this.teams.find(team => team.id === response.id);
          if (team) {
            this.teamsTournament.push(team);
            this.teams = this.teams.filter(t => t.id !== team.id);
            this.teamsFilters = [...this.teams];
          }
        }
      },
      error: (err) => {
      },
    });
  }

  /** Retest (c): la seleccion de equipos sobrevive a recargar o salir y volver (sessionStorage, por torneo). */
  private selectionKey(): string { return 'initTeams:' + this.code; }
  private persistSelection(): void {
    if (!this.code) return;
    try { sessionStorage.setItem(this.selectionKey(), JSON.stringify(this.teamsTournament.map(t => t.id))); } catch { /* sin storage */ }
  }
  private restoreSelection(): void {
    if (!this.code || this.teamsTournament.length) return;
    let ids: number[] = [];
    try { ids = JSON.parse(sessionStorage.getItem(this.selectionKey()) || '[]'); } catch { ids = []; }
    if (!Array.isArray(ids) || !ids.length) return;
    const picked = this.teams.filter(t => ids.includes(t.id));
    if (!picked.length) return;
    this.teamsTournament = picked;
    this.tournamentService.setTeamsToInitTournament(this.teamsTournament);
  }

  filterTeamsTournament() {
    this.teams = this.teams.filter(team =>
      !this.teamsTournament.some(t => t.id === team.id)
    );
    this.teamsFilters = [...this.teams];
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
    this.tournamentService.setDateToInitTournament({ date: this.date, days: this.days, minutes: this.minutes });
  }

  initTournament() {
    if (this.teamsTournament.length >= 2) { // Plan 22/10 #8: mínimo 2 equipos
      const ids = this.teamsTournament.map(team => team.id);
      const initializeRequest = {
        tournamentCode: this.code,
        teams: ids,
        startDate: this.date || null,
        minutesPerMatch: this.date ? this.minutes : null,
        dayBetweenMatchDay: this.date ? this.days : null
      };
      if (this.date && !(Number(this.days) >= 1)) { this.alertService.errorAlert('El intervalo entre fechas tiene que ser de al menos 1 d\u00eda.'); return; }
      if (this.date && !(Number(this.minutes) >= 1)) { this.alertService.errorAlert('La duraci\u00f3n de cada partido tiene que ser de al menos 1 minuto.'); return; }
      this.adminService.checkTeams(initializeRequest).subscribe({
        error: (err) => this.alertService.errorAlert(httpErrorMessage(err, 'No se pudo revisar el torneo. Prob\u00e1 de nuevo.')),
        next: () => this.confirmAndInit(initializeRequest)
      });
    } else {
      this.alertService.errorAlert('El torneo debe tener al menos 2 equipos');
    }
  }

  private confirmAndInit(initializeRequest: any) {
    {
      this.alertService.infoAlertTournament('INFORMACIÓN DEL TORNEO', this.teamsTournament, this.splitDate(this.date).dateWithStrings, this.minutes, this.days)
        .then((result) => {
          if (result.isConfirmed) {
            this.alertService.loadingAlert('Inicializando torneo...');
            this.adminService.initTournament(initializeRequest).subscribe({
              next: () => {
                this.tournamentService.getTournamentFull(this.code).subscribe({
                  next: (response) => {
                    this.tournamentService.currentTournament.next(response);
                    this.dashboardService.setActiveTournamentComponent('recap');
                    this.dashboardService.setHaveParticipants(true);
                    this.alertService.successAlert('Torneo inicializado correctamente');
                  }
                });
              },
              error: (err) => {
                this.alertService.errorAlert(httpErrorMessage(err, 'No se pudo completar la acci\u00f3n. Prob\u00e1 de nuevo.'));
              },
              complete: () => {
              }
            });
          } else {
            return;
          }
        });
    }
  }

  addTeam(team: TeamResponse) {
    if (!this.teamsTournament.some(item => item.id === team.id)) {
      this.teamsTournament.push(team);
      this.tournamentService.setTeamsToInitTournament(this.teamsTournament); this.persistSelection();
      this.teams = this.teams.filter(t => t !== team);
      this.teamsFilters = this.teamsFilters.filter(t => t !== team);
    } else {
      return;
    }
  }

  deleteTeam(team: TeamResponse) {
    this.teamsTournament = this.teamsTournament.filter(t => t.id !== team.id);
    if (!this.teamsFilters.some(t => t.id === team.id)) this.teamsFilters = [...this.teamsFilters, team];
    this.teamsFilters.sort((a, b) => naturalCompare(a.name, b.name));
    this.tournamentService.setTeamsToInitTournament(this.teamsTournament); this.persistSelection();
    this.filterTeams();
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
    this.tournamentService.setDateToInitTournament({ date: this.date, days: this.days, minutes: this.minutes });
  }

  splitDate(date: string) {
    if (!date) {
      return { dateWithStrings: '', hours: '' };
    }
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
    this.tournamentService.setDateToInitTournament({ date: '', days: 0, minutes: 0 });
  }

  resetFilters() {
    this.searchTerm = '';
    this.teams = [...this.teamsFilters];
  }

  deleteAllTeams() {
    // Recorrido 22/10: pedir confirmación antes de vaciar la selección.
    this.alertService.confirmAlert('¿Quitar todos los equipos?', 'La selección quedará vacía. Podés volver a agregarlos desde la lista.', 'Quitar todos')
      .then((result) => { if (result.isConfirmed) this.doDeleteAllTeams(); });
  }

  private doDeleteAllTeams() {
    this.teamsFilters = [...new Map([...this.teamsFilters, ...this.teamsTournament].map(team => [team.id, team])).values()]
      .sort((a, b) => naturalCompare(a.name, b.name));
    this.teamsTournament = [];
    this.tournamentService.setTeamsToInitTournament(this.teamsTournament); this.persistSelection();
    this.filterTeams();
  }


  addAllTeams() {
    this.teams.forEach(team => {
      this.teamsTournament.push(team);
      this.teamsFilters = this.teamsFilters.filter(t => t !== team);
    });
    this.teams = [];
    this.tournamentService.setTeamsToInitTournament(this.teamsTournament); this.persistSelection();
  }


}

