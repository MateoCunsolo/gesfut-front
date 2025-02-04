import { DashboardService } from './../../../core/services/dashboard.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatchDaysService } from '../../../core/services/tournament/match-days.service';
import { INITIAL_DETAILED_MATCH } from '../../../core/services/tournament/initial-tournament';
import { MatchDetailedResponse } from '../../../core/models/matchDetailedRequest';
import {
  EventResponse,
  ParticipantResponse,
  PlayerParticipantResponse,
} from '../../../core/models/tournamentResponse';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-load-result',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './load-result.component.html',
  styleUrls: ['./load-result.component.scss'],
})
export class LoadResultComponent {
  currentMatch: MatchDetailedResponse = INITIAL_DETAILED_MATCH;
  searchQuery: string = '';
  filteredTeams: ParticipantResponse[] = [];
  selectedTeam: ParticipantResponse | null = null;
  filteredPlayers: PlayerParticipantResponse[] = [];
  selectedPlayer: PlayerParticipantResponse | null = null;
  events: any[] = [];
  eventsCopy: any = [];
  awayWin: boolean = false;
  homeWin: boolean = false;
  statisticsForm: FormGroup;
  isEditMatch: boolean = false;
  constructor(
    private matchDayService: MatchDaysService,
    private fb: FormBuilder,
    private DashboardService: DashboardService,
    private alertService: AlertService
  ) {
    this.statisticsForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      shirt: [0],
      team: ['', Validators.required],
      goals: [0, [Validators.required, Validators.min(0)]],
      yellowCard: [
        0,
        [Validators.required, Validators.min(0), Validators.max(2)],
      ],
      redCard: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      mvp: [false],
    });
  }

  ngOnInit() {
    this.matchDayService.editResult.subscribe({
      next: (edit: boolean) => {
        if (edit) {
          this.isEditMatch = true;
        }else{
          this.isEditMatch = false;
        }
      },
    }) 

    this.matchDayService.currentMatch.subscribe({
      next: (match: MatchDetailedResponse) => {
        this.currentMatch = match;
        this.filteredTeams = [
          this.currentMatch.homeTeam,
          this.currentMatch.awayTeam,
        ];
        this.filteredTeams = this.filteredTeams.filter(
          (team) => team.name !== 'Home Team' && team.name !== 'Away Team'
        );
        if (match.events.length > 0) {
          this.events = this.mapEventsAndAgruopStatics(match.events);
          this.eventsCopy = this.events.map((event) => ({ ...event }));
        }

        this.statisticsForm.get('team')?.valueChanges.subscribe((team) => {
          this.selectedTeam = team;
          this.updateFilteredPlayers();
          this.statisticsForm.get('name')?.setValue('');
        });

        this.statisticsForm.get('name')?.valueChanges.subscribe((player) => {
          this.selectedPlayer = player;
          this.activateStatics();
        });

        this.disableMvpIfNeeded();
        this.whoWins();
      },
    });
  }

  disableMvpIfNeeded() {
    if (this.events.some((event) => event.mvp)) {
      this.statisticsForm.get('mvp')?.disable();
    } else {
      this.statisticsForm.get('mvp')?.enable();
    }
  }

  updateFilteredPlayers() {
    if (this.selectedTeam === this.currentMatch.homeTeam) {
      this.filteredPlayers =
        this.currentMatch.homeTeam.playerParticipants.filter(
          (player) => player.isActive === true && player.isSuspended === false
        );
    } else if (this.selectedTeam === this.currentMatch.awayTeam) {
      this.filteredPlayers =
        this.currentMatch.awayTeam.playerParticipants.filter(
          (player) => player.isActive === true && player.isSuspended === false
        );
    } else {
      this.filteredPlayers = [];
    }
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase();
    this.filteredPlayers = this.filteredPlayers.filter((player) =>
      player.playerName.toLowerCase().includes(query)
    );
  }

  loadStatistics() {
    if (this.statisticsForm.valid) {
      //si no cargo ninguna estadistica retornar error:
      if(
        this.statisticsForm.get('goals')?.value === 0 &&
        this.statisticsForm.get('yellowCard')?.value === 0 &&
        this.statisticsForm.get('redCard')?.value === 0 &&
        this.statisticsForm.get('mvp')?.value === false
      ){
        this.alertService.errorAlert('Debes cargar al menos una estadística del jugador.');
        return;
      }

      const selectedPlayer = this.statisticsForm.get('name')?.value;
      const newEvent = {
        ...this.statisticsForm.value,
        team: this.statisticsForm.get('team')?.value.name,
        name: `${selectedPlayer?.playerName} ${selectedPlayer?.playerLastName}`,
        id: selectedPlayer?.id,
      };

      if (this.currentMatch.homeTeam.name === newEvent.team) {
        this.currentMatch.homeGoals += newEvent.goals;
      } else {
        this.currentMatch.awayGoals += newEvent.goals;
      }
      this.whoWins();
      if (this.events.some((event) => event.id === newEvent.id)) {
        this.toGroupStaticsForPlayer(newEvent);
      } else {
        this.events.push(newEvent);
      }
      console.log(this.events);
      this.statisticsForm.reset({
        id: 0,
        name: '',
        shirt: 0,
        team: '',
        goals: 0,
        yellowCard: 0,
        redCard: 0,
        mvp: false,
      });
    }
  }

  saveEvents() {
    if (this.matchDayService.editResult.value === true) {
      console.log('es editando');
      if (this.eventsAreEquals()) {
        this.DashboardService.setActiveTournamentComponent('match-days');
      } else {
        this.matchDayService.saveEditEvents(this.events, this.currentMatch.id);
      }
    } else {
      console.log('es primera carga');
      this.matchDayService.saveEvents(this.events, this.currentMatch.id);
    }
  }

  eventsAreEquals(): boolean {
    const areEqual =
      this.events.length === this.eventsCopy.length &&
      this.events.every(
        (event, index) =>
          JSON.stringify(event) === JSON.stringify(this.eventsCopy[index])
      );

    if (areEqual) {
      console.log('EVENTOS IGUALES');
      this.DashboardService.setActiveTournamentComponent('match-days');
      return true;
    }
    return false;
  }

  async deleteEvent(event: any) {
    const result = await this.alertService.confirmAlert(
      '¿Desea eliminar este evento?',
      'Confirma para aceptar',
      'Confirmar'
    );

    if (result.isConfirmed) {
      if (this.currentMatch.homeTeam.name === event.team) {
        this.currentMatch.homeGoals -= event.goals;
      } else {
        this.currentMatch.awayGoals -= event.goals;
      }
      this.whoWins();

      this.events = this.events.filter((e) => e !== event);
      this.statisticsForm.get('name')?.setValue('');
      this.updateFilteredPlayers();
      this.disableMvpIfNeeded();
    }
  }

  isTeamSelected() {
    if (this.statisticsForm.get('team')?.value === '') {
      this.alertService.errorAlert('Debes seleccionar un equipo');
      return false;
    } else {
      return true;
    }
  }

  isPlayerSelected() {
    if (this.statisticsForm.get('name')?.value === '') {
      this.desactivetStatics();
      this.alertService.errorAlert('Debes seleccionar un jugador');
      return false;
    } else {
      return true;
    }
  }

  activateStatics() {
    this.statisticsForm.get('yellowCard')?.enable();
    this.statisticsForm.get('redCard')?.enable();
    this.statisticsForm.get('goals')?.enable();
    this.statisticsForm.get('mvp')?.enable();
  }

  desactivetStatics() {
    this.statisticsForm.get('yellowCard')?.disable();
    this.statisticsForm.get('redCard')?.disable();
    this.statisticsForm.get('goals')?.disable();
    this.statisticsForm.get('mvp')?.disable();

    this.statisticsForm.get('yellowCard')?.setValue(0);
    this.statisticsForm.get('redCard')?.setValue(0);
    this.statisticsForm.get('goals')?.setValue(0);
    this.statisticsForm.get('mvp')?.setValue(false);
  }

  mapEventsAndAgruopStatics(events: EventResponse[]): any[] {
    const groupedEvents = events.reduce((acumuletor, event) => {
      const { idPlayerParticipant, playerName, teamName, type, quantity } = event;
  
      if (!acumuletor[idPlayerParticipant]) {
        acumuletor[idPlayerParticipant] = {
          id: idPlayerParticipant,
          team: teamName,
          name: playerName,
          goals: 0,
          yellowCard: 0,
          redCard: 0,
          shirt: 0,
          mvp: false,
        };
      }

      if (type === "GOAL") acumuletor[idPlayerParticipant].goals += quantity;
      if (type === "YELLOW_CARD") acumuletor[idPlayerParticipant].yellowCard += quantity;
      if (type === "RED_CARD") acumuletor[idPlayerParticipant].redCard += quantity;
      if (type === "MVP") acumuletor[idPlayerParticipant].mvp = true;
      return acumuletor;
    }, {} as Record<number, any>);
  
    return Object.values(groupedEvents);
  }
  

  whoWins() {
    if (this.currentMatch.homeGoals > this.currentMatch.awayGoals) {
      this.homeWin = true;
      this.awayWin = false;
    } else {
      this.awayWin = true;
      this.homeWin = false;
    }

    if (this.currentMatch.homeGoals === this.currentMatch.awayGoals) {
      this.homeWin = false;
      this.awayWin = false;
    }
  }

  get isMvpSelected() {
    return this.events.some((event) => event.mvp === true);
  }

  btnBack() {
    this.matchDayService.editResult.next(false);
    this.DashboardService.setActiveTournamentComponent('match-days');
  }

  toGroupStaticsForPlayerEdit(event: any) {
    const index = this.events.findIndex((e) => e.id === event.id);
    this.events[index].goals = event.goals;
    this.events[index].yellowCard = event.yellowCard;
    this.events[index].redCard = event.redCard;
    this.events[index].mvp = event.mvp;
  }

  toGroupStaticsForPlayer(event: any) {
    const index = this.events.findIndex((e) => e.id === event.id);
    this.events[index].goals += event.goals;
    this.events[index].yellowCard += event.yellowCard;
    this.events[index].redCard += event.redCard;
    this.events[index].mvp = event.mvp;
  }

  addGoals(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.goals++;
    }
    if (this.currentMatch.homeTeam.name === event.team) {
      this.currentMatch.homeGoals += 1;
    } else {
      this.currentMatch.awayGoals += 1;
    }
  }

  addYellowCard(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.yellowCard++;
    }
  }

  addRedCard(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.redCard++;
    }
  }

  changeMvpStatus(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.mvp = !event.mvp;
      this.analizeStats(event);
    }
  }

  removeGoal(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event && event.goals > 0) {
      event.goals--;
      this.analizeStats(event);
    }else{
      this.noLessThanZero();
    }

    if (this.currentMatch.homeTeam.name === event.team) {
      if (this.currentMatch.homeGoals > 0) this.currentMatch.homeGoals -= 1;
    } else {
      if (this.currentMatch.awayGoals > 0) this.currentMatch.awayGoals -= 1;
    }
  }

  removeYellowCard(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event && event.yellowCard > 0) {
      event.yellowCard--;
      this.analizeStats(event);
    }else{
      this.noLessThanZero();
    }
  }

  removeRedCard(id: number) {
    const event = this.events.find((e) => e.id === id);
    if (event && event.redCard > 0) {
      event.redCard--;
      this.analizeStats(event);
    }else{
      this.noLessThanZero();
    }
    
  }

  noLessThanZero() {
    this.alertService.errorAlert('No puedes tener valores negativos');
  }


  analizeStats(event: any) {
    if(event.yellowCard === 0
      && event.redCard === 0
      && event.goals === 0
      && event.mvp === false
    ){
      this.events = this.events.filter((e) => e !== event);
    }
  }
}
