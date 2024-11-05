import { Component } from '@angular/core';
import { TournamentResponseShort } from '../../core/models/tournamentResponseShort';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';
import { TouranmentCurrentService } from '../../core/services/tournamentCurrent';

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

  constructor(private adminService: AdminService, private route:Router, private tournamentCurrent: TouranmentCurrentService) {}

  ngOnInit(): void {``
    this.adminService.getTournamentShort().subscribe(
      data => {
        this.tournaments = data;
        this.applyFilters();
      },
      error => {
        console.log(error);
      }
    );
  }

  toTournament(code:string){
    let tournament = this.tournaments.find(tournament => tournament.code === code);
    if (tournament) {
      this.tournamentCurrent.setTournamentCurrent(tournament);
    }else{
      alert('Torneo no encontrado');
    }
    this.route.navigate(['/admin/tournaments']);

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
