import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';

@Component({
  selector: 'app-list-tournaments',
  standalone: true,
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

  constructor(private tournamentService: TournamentService, private route: Router, private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.tournamentService.currentListTournaments.subscribe({
      next: (response: TournamentResponseShort[]) => {
        this.tournaments = response;
        if (this.tournaments.length > 0) {
          this.haveTournaments = true;
        }
        this.applyFilters();
      }
    })

  }

  changeComponent(component: string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }

  changeNameTournament(code: string) {
    let name = window.prompt('Introduce el nuevo nombre del torneo');
    if (name === null) {
      console.log('Operación del cambio de nombre cancelada');
    } else if (name === '') {
      alert('El nombre introducido no es válido');
    } else if (name === this.tournaments.find(tournament => tournament.code === code)!.name) {
      alert('El nombre introducido es igual al actual');
    } else if (name.length > 50 || name.length < 3) {
      alert('El nombre debe tener entre 3 y 50 caracteres');
    } else {

      let flag = false;
      this.tournaments.forEach(tournament => {
        if (tournament.name === name) {
          flag = true;
        }
      });
      if (flag) {
        alert('Ya existe un torneo con ese nombre');
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
  }

  toTournament(code: string) {
    this.tournamentService.currentTournament.next(INITIAL_TOURNAMENT);
    localStorage.setItem('lastTournamentClicked', code);
    localStorage.setItem('lastTournamentClickedName', this.tournaments.find(tournament => tournament.code === code)?.name || '');
    this.dashboardService.setNameTournament(this.tournaments.find(tournament => tournament.code === code)?.name || '');
    this.route.navigate([`/admin/tournaments/${code}`]);
  }


  applyFilters(): void {
    this.filteredTournaments = this.tournaments
      .filter(tournament => {
        const matchesSearch = tournament.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesFilter = this.filter === 'all' ||
          (this.filter === 'finished' && tournament.isFinished) ||
          (this.filter === 'inProgress' && !tournament.isFinished);
        return matchesSearch && matchesFilter;
      })
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
