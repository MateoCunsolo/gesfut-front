import { Component, EventEmitter, Output } from '@angular/core';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { INITIAL_TOURNAMENT } from '../../core/services/tournament/initial-tournament';

@Component({
  selector: 'app-list-tournaments',
  standalone: true,
  imports: [],
  templateUrl: './list-tournaments.component.html',
  styleUrl: './list-tournaments.component.scss'
})
export class ListTournamentsComponent {

  

  tournaments: TournamentResponseShort[] = [];
  filteredTournaments: TournamentResponseShort[] = [];
  searchQuery: string = '';
  filter: string = 'all';

  constructor(private tournamentService: TournamentService, private route: Router, private dashboardService:DashboardService) { }

  ngOnInit(): void { 
    this.tournamentService.currentListTournaments.subscribe({
      next: (response: TournamentResponseShort[]) => {
        this.tournaments = response;
        this.applyFilters();
      }
    })

  }

  changeComponent(component:string){
    this.dashboardService.setActiveDashboardAdminComponent(component);
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
