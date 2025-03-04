import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-list-tournaments',
    imports: [DatePipe, CommonModule],
    templateUrl: './list-tournaments.component.html',
    styleUrl: './list-tournaments.component.scss'
})
export class ListTournamentsComponent {


  haveTournaments: boolean = false;
  tournaments: TournamentResponseShort[] = [];
  filteredTournaments: TournamentResponseShort[] = [];
  searchQuery: string = '';
  filter: string = 'all';

  constructor(private tournamentService: TournamentService, private route: Router, private dashboardService: DashboardService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.tournamentService.currentListTournaments.subscribe({
      next: (response: TournamentResponseShort[]) => {
        this.tournaments = response;
        this.haveTournaments = this.tournaments.length > 0;
        if (this.haveTournaments) {
          this.applyFilters();
        }
      }
    })

  }

  reOrganizeTournaments() {

  }



  restoreTournament(code: string) {
    this.alertService.confirmAlert('¿Estás seguro de que quieres restaurar este torneo?', 'Se recuperarán todos los datos', 'Sí, restaurar').then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.changeIsActive(code, true).subscribe({
          next: (response) => {
            if (response) {
              this.tournaments.find(tournament => tournament.code === code)!.isActive = true;
              this.tournamentService.getTournamentShortList().subscribe({
                next: (response) => {
                  this.tournaments = response;
                  this.applyFilters();
                }
              });
            }
          }
        });
      } else {
        this.alertService.errorAlert('Operación cancelada');
      }
    })

  }

  deleteTournament(code: string) {
    this.alertService.confirmAlert('¿Estás seguro de que quieres eliminar este torneo?', 'Estara 7 dias en papelera y luego se elinara.', 'Sí, eliminar').then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.changeIsActive(code, false).subscribe({
          next: (response) => {
            if (response) {
              this.tournaments = this.tournaments.filter(tournament => tournament.code !== code);
              this.tournamentService.getTournamentShortList().subscribe({
                next: (response) => {
                  this.tournaments = response;
                  this.applyFilters();
                }
              });
            }}
          });
      } else {
        this.alertService.errorAlert('Operación cancelada');
      }
    })
  }


  changeComponent(component: string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }

  changeNameTournament(code: string) {
    this.alertService.inputAlert('Introduce el nuevo nombre del torneo').then((result) => {
      let name = result.value;
      if (name === null) {
        console.log('Operación del cambio de nombre cancelada');
      } else if (name === '') {
        this.alertService.errorAlert('Debes introducir un nombre');
      } else if (name === this.tournaments.find(tournament => tournament.code === code)!.name) {
        this.alertService.errorAlert('El nombre introducido es igual al actual');
      } else if (name.length > 50 || name.length < 3) {
        this.alertService.errorAlert('El nombre debe tener entre 3 y 50 caracteres');
      } else {

        let flag = false;
        this.tournaments.forEach(tournament => {
          if (tournament.name === name) {
            flag = true;
          }
        });
        if (flag) {
          this.alertService.errorAlert('Ya existe un torneo con ese nombre');
        } else {
          this.tournaments.forEach(tournament => {
            if (tournament.code === code) {
              tournament.name = 'cambiando nombre. . .';
            }
          });
          this.tournamentService.changeNameTournament(code, name).subscribe({
            next: (response) => {
              if (response) {
                this.tournaments.find(tournament => tournament.code === code)!.name = name;
                this.applyFilters();
              }
            }
          });
        }
      }
    });

  }

  toTournament(code: string) {
    if (this.tournaments.find(tournament => tournament.code === code)!.isActive === false) {
      this.alertService.errorAlert('Este torneo fue eliminado.');
      return;
    }
    this.tournamentService.currentTournament.next(INITIAL_TOURNAMENT);
    localStorage.setItem('lastTournamentClicked', code);
    localStorage.setItem('lastTournamentClickedName', this.tournaments.find(tournament => tournament.code === code)?.name || '');
    this.dashboardService.setNameTournament(this.tournaments.find(tournament => tournament.code === code)?.name || '');
    this.route.navigate([`/admin/tournaments/${code}`]);
  }


  applyFilters(): void {
    this.filteredTournaments = this.tournaments.filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesFilter =
        (this.filter === 'all' && tournament.isActive) ||
        (this.filter === 'finished' && tournament.isFinished && tournament.isActive) ||
        (this.filter === 'inProgress' && !tournament.isFinished && tournament.isActive) || 
        (this.filter === 'trash' && tournament.isActive === false);
      return matchesSearch && matchesFilter;
    });
    
    this.haveTournaments = this.filteredTournaments.length > 0;
  }
  

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value || '';
    this.searchQuery = query;
    this.applyFilters();
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const filter = select.value || 'all';
    this.filter = filter;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filter = 'all';
    this.applyFilters();
  }



}  
