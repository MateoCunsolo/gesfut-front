import { DashboardService } from './../../../core/services/dashboard.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';
import { INITIAL_DETAILED_MATCH } from '../../../core/services/tournament/initial-tournament';
import { MatchDetailedResponse } from '../../../core/models/matchDetailedRequest';
import { ParticipantResponse, PlayerParticipantResponse } from '../../../core/models/tournamentResponse';

@Component({
  selector: 'app-load-result',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './load-result.component.html',
  styleUrls: ['./load-result.component.scss']
})
export class LoadResultComponent {

  currentMatch: MatchDetailedResponse = INITIAL_DETAILED_MATCH;
  searchQuery: string = '';
  filteredTeams: ParticipantResponse[] = [];
  selectedTeam: ParticipantResponse | null = null;
  filteredPlayers: PlayerParticipantResponse[] = [];
  selectedPlayer: PlayerParticipantResponse | null = null;
  events: any[] = [];

  statisticsForm: FormGroup;

  constructor(
    private matchDayService: MatchDaysService,
    private fb: FormBuilder,
    private DashboardService:DashboardService
  ) {
    this.statisticsForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      shirt: [0],
      team: ['', Validators.required],
      goals: [0, [Validators.required, Validators.min(0)]],
      yellowCard: [0, [Validators.required, Validators.min(0), Validators.max(2)]],
      redCard: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      mvp: [false]
    })
  }

  ngOnInit() {
    this.matchDayService.currentMatch.subscribe({
      next: (match: MatchDetailedResponse) => {
        this.currentMatch = match;
        this.filteredTeams = [this.currentMatch.homeTeam, this.currentMatch.awayTeam];
        this.filteredTeams = this.filteredTeams.filter(team => team.name !== 'Home Team' && team.name !== 'Away Team');
        this.selectedTeam = match.homeTeam;
        this.updateFilteredPlayers();

        this.statisticsForm.get('team')?.valueChanges.subscribe(team => {
          this.selectedTeam = team;
          this.updateFilteredPlayers();
        });

        this.statisticsForm.get('name')?.valueChanges.subscribe(player => {
          this.selectedPlayer = player;
        });

        this.disableMvpIfNeeded();
      }
    })
  }

  disableMvpIfNeeded() {
    if (this.events.some(event => event.mvp)) {
      this.statisticsForm.get('mvp')?.disable();
    } else {
      this.statisticsForm.get('mvp')?.enable();
    }
  }

  updateFilteredPlayers() {
    if (this.selectedTeam === this.currentMatch.homeTeam) {
      this.filteredPlayers = this.currentMatch.homeTeam.playerParticipants.filter((player) => player.isActive === true);
      this.selectedPlayer = this.selectedTeam.playerParticipants[0];
    } else if (this.selectedTeam === this.currentMatch.awayTeam) {
      this.filteredPlayers = this.currentMatch.awayTeam.playerParticipants.filter((player) => player.isActive === true);
      this.selectedPlayer = this.selectedTeam.playerParticipants[0];
    }

    if (this.selectedPlayer) {
      this.statisticsForm.patchValue({
        id: this.selectedPlayer.id
      });
    }
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase();
    this.filteredPlayers = this.filteredPlayers.filter(player =>
      player.playerName.toLowerCase().includes(query)
    );
  }

  loadStatistics() {
    if (this.statisticsForm.valid) {
      const selectedPlayer = this.statisticsForm.get('name')?.value;
      const newEvent = {
        ...this.statisticsForm.value,
        team: this.statisticsForm.get('team')?.value.name,
        name: `${selectedPlayer?.playerName} ${selectedPlayer?.playerLastName}`,
        id: selectedPlayer?.id
      };
      this.events.push(newEvent);
      console.log(newEvent);
      this.statisticsForm.reset({
        id: 0,
        name: '',
        shirt: 0,
        team: '',
        goals: 0,
        yellowCard: 0,
        redCard: 0,
        mvp: false
      });
    }
  }

  saveEvents(){
    this.matchDayService.saveEvents(this.events, this.currentMatch.id);
  }

  get isMvpSelected() {
    return this.events.some(event => event.mvp === true);
  }

  btnBack(){
    this.DashboardService.setActiveTournamentComponent('match-days');
  }
}
