import { roundLabel } from '../../core/utils/round-label';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchCardComponent } from '../../shared/match-card/match-card.component';
import { Component, DestroyRef, inject } from '@angular/core';
import { MatchDaysService } from '../../core/services/tournament/match-days.service';
import { ActivatedRoute } from '@angular/router';
import { MatchDayResponse } from '../../core/models/tournamentResponse';
import { WeatherCardComponent } from './weather-card/weather-card.component';
import { WeatherService } from '../../core/services/weather-api/weather.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NgClass, NgIf } from '@angular/common';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { PublicPageComponent } from '../../pages/public-page/public-page.component';
import { ChampionsComponent } from '../../shared/champions/champions.component';
import { showPreparingState } from '../../core/utils/recap-state';

@Component({
  selector: 'app-recap',
  imports: [MatchCardComponent, WeatherCardComponent, ChampionsComponent],
  templateUrl: './recap.component.html',
  styleUrl: './recap.component.scss',
})
export class RecapComponent {
  roundLabel = roundLabel;
  private destroyRef = inject(DestroyRef);
  tournamentCode!: string;
  lastMatchDay!: MatchDayResponse;
  topScorers: { playerName: string; goals: number }[] = [];
  previousSliceTopScores: { playerName: string; goals: number }[] = [];
  forecast: any;
  loadingWeather: boolean = false;
  isPreviousDayAvailable: boolean = false;
  /** Lote 24/10 (a): hasta tener la respuesta de la ultima fecha no se muestra el estado vacio. */
  lastDayLoaded = false;
  showPreparing(): boolean { return !this.lastMatchDay && showPreparingState(this.lastDayLoaded, this.tournamentService.currentTournament.value, this.tournamentCode); }
  constructor(
    private route: ActivatedRoute,
    private matchDaysService: MatchDaysService,
    private weatherService: WeatherService,
    private tournamentService: TournamentService
  ) {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const code = params.get('code');
      if (code) {
        this.tournamentCode = code;
        this.lastDayLoaded = false;
        this.loadLastMatchDay(code);
      }
    });
  }

  // ngOnInit() {
  //   this.tournamentService.currentTournament.subscribe({
  //     next: (response) => {
  //       this.lastMatchDay = response.matchDays[response.matchDays.length - 1];
  //     },
  //   });
  // }

  verifyNextMatchDay() {
    const days = this.tournamentService.currentTournament.value.matchDays;
    const index = days.findIndex(day => day.idMatchDay === this.lastMatchDay?.idMatchDay);
    const next = days[index + 1];
    if (index >= 0 && this.lastMatchDay.isFinished && next?.matches.some(match => match.isFinished)) {
      this.lastMatchDay = structuredClone(next);
      this.loadTopScorers();
      this.getForecast();
      this.orderForDateMatchDay();
    }
  }

  loadLastMatchDay(code: string) {
    this.matchDaysService.getLastPlayedMatchDay(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: MatchDayResponse) => {
        if (code !== this.tournamentCode) return;
        this.lastDayLoaded = true;
        if (!response) return;
        this.lastMatchDay = structuredClone(response);
        this.loadTopScorers();
        this.getForecast();
        this.verifyNextMatchDay();
        this.orderForDateMatchDay();
      },
      error: () => { if (code === this.tournamentCode) this.lastDayLoaded = true; },
    });
  }

  loadTopScorers() {
    this.previousSliceTopScores = [];
    const playerGoals: { [key: string]: number } = {};
    this.lastMatchDay.matches.forEach((match) => {
      match.events.forEach((event) => {
        if (event.type === 'GOAL') {
          if (playerGoals[event.playerName]) {
            playerGoals[event.playerName] += event.quantity;
          } else {
            playerGoals[event.playerName] = event.quantity;
          }
        }
      });
    });

    this.topScorers = Object.keys(playerGoals).map((playerName) => ({
      playerName,
      goals: playerGoals[playerName],
    }));

    this.topScorers.sort((a, b) => b.goals - a.goals);
    if (this.topScorers.length > 10) {
      this.previousSliceTopScores = [...this.topScorers];
      this.topScorers = this.topScorers.slice(0, 10);
      
    }
  }


  viewMoreTopScores(){
    if(this.topScorers.length === 10){
      this.topScorers = this.previousSliceTopScores;
    }else{
      this.topScorers = this.topScorers.slice(0, 10);
    }
  }

  getForecast() {
    if (
      !this.lastMatchDay ||
      !this.lastMatchDay.matches ||
      this.lastMatchDay.matches.length === 0
    ) {
      this.loadingWeather = false;
      return;
    }

    const location = 'Mar del Plata';
    const targetDateTime = this.lastMatchDay.matches[0]?.dateTime;

    if (!targetDateTime) {
      this.loadingWeather = false;
      this.forecast = null;
      return;
    }

    const targetDate = this.formatDate(targetDateTime);

    if (!targetDate) {
      return;
    }

    this.weatherService.getForecast(location, 14).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      if (data && data.forecast && data.forecast.forecastday) {
        const forecastDay = data.forecast.forecastday.find(
          (day: { date: string }) => day.date === targetDate
        );
    
        if (forecastDay) {
          this.forecast = {
            date: forecastDay.date,
            avgTemp: forecastDay.day.avgtemp_c,
            maxTemp: forecastDay.day.maxtemp_c, 
            minTemp: forecastDay.day.mintemp_c,
            wind_kph: forecastDay.day.maxwind_kph, 
            chance_of_rain: forecastDay.day.daily_chance_of_rain, 
            condition: forecastDay.day.condition 
          };
        } else {
          this.isPreviousDayAvailable = false;
          this.forecast = null;
        }
      }
    });
    
  }

  formatDate(dateTime: string): string {
    // Expresión regular para extraer la fecha en español (ej: "jue 6 de feb 2025 | 14:00 hs")
    const regex = /(\d{1,2}) de (\w+) (\d{4})/;
    const match = dateTime.toLowerCase().match(regex);

    if (!match) {
      return '';
    }

    const [, day, month, year] = match;

    // Mapeo de meses en español a números
    const months: { [key: string]: string } = {
      ene: '01',
      feb: '02',
      mar: '03',
      abr: '04',
      may: '05',
      jun: '06',
      jul: '07',
      ago: '08',
      sep: '09',
      oct: '10',
      nov: '11',
      dic: '12',
    };

    const monthNumber = months[month.substring(0, 3)]; // Tomamos solo los primeros 3 caracteres
    if (!monthNumber) {
      return '';
    }

    return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
  }

  formatHour(dateTime: string): string {
    const regex = /(\d{1,2}):(\d{2})/;
    const match = dateTime.match(regex);

    if (!match) {
      return '';
    }

    return match[1].padStart(2, '0'); // Extrae la hora en formato HH
  }

  getMatchDayStatus() { 
    let date: any;
    if (this.lastMatchDay.matches[0]?.dateTime == null) {
      date = '( no hay horarios definidos )';
    } else {
      date = this.lastMatchDay.matches[0]?.dateTime.split('|')[0].toUpperCase();
    }

    if (
      this.lastMatchDay.isFinished &&
      this.lastMatchDay.matches.every((match) => match.isFinished)
      && !this.lastMatchDay.isPlayOff
    ) {
      return (
        'RESUMEN DE LA FECHA Nº' + (this.lastMatchDay.numberOfMatchDay + 1)
      );
    }else if(this.lastMatchDay.isFinished && this.lastMatchDay.isPlayOff){
      return (
        'RESUMEN DEL PLAYOFFS'
      );
    }

    const anyMatchFinished = this.lastMatchDay.matches.some(
      (match) => match.isFinished
    );
    if (anyMatchFinished && !this.lastMatchDay.isFinished && !this.lastMatchDay.isPlayOff) {
      return (
        'FECHA Nº' +
        (this.lastMatchDay.numberOfMatchDay + 1) +
        ' JUGANDOSE ACTUALMENTE'
      );
    }else if(anyMatchFinished && !this.lastMatchDay.isFinished && this.lastMatchDay.isPlayOff){
      return (
        'PLAYOFFS JUGANDOSE ACTUALMENTE'
      );

    }
    if(this.lastMatchDay.isPlayOff){
      return (
        'PROXIMO PLAYOFFS'
      );  
    }
    return (
      'PRÓXIMA FECHA Nº' + (this.lastMatchDay.numberOfMatchDay + 1) + ' ' + date
    );
  }

  someMatchIsClosed() {
    return this.lastMatchDay.matches.some((match) => match.isFinished);
  }

  returnHour(dateTime: string) {
    const dateTimeString = dateTime;
    const time = dateTimeString?.split('|')[1]?.trim().split(' ')[0] || '';
    return time;
  }

  orderForDateMatchDay() {
    if (
      this.lastMatchDay &&
      this.lastMatchDay.matches.some((match) => match.dateTime != null)
    ) {
      this.lastMatchDay.matches.sort((a, b) => {
        if (this.returnHour(a.dateTime) > this.returnHour(b.dateTime)) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }

  nextOrBackMatchDay() {
    if (this.returnText() === 'VER PROXIMA FECHA') {
      this.nextMatchDay();
    } else {
      this.previousMatchDay();
    }
  }

  private moveMatchDay(offset: number) {
    const days = this.tournamentService.currentTournament.value.matchDays;
    const index = days.findIndex(day => day.idMatchDay === this.lastMatchDay?.idMatchDay);
    const next = days[index + offset];
    if (index < 0 || !next) return;
    this.lastMatchDay = structuredClone(next);
    this.loadTopScorers();
    this.getForecast();
    this.orderForDateMatchDay();
  }

  nextMatchDay() { this.moveMatchDay(1); }
  previousMatchDay() { this.moveMatchDay(-1); }

  returnText() {
    if (
      (this.lastMatchDay.isFinished || this.isTheFirst()) &&
      !this.isTheLast()
    ) {
      return 'VER PROXIMA FECHA';
    } else {
      return 'VER FECHA ANTERIOR';
    }
  }

  isTheFirst(): boolean {
    if (this.lastMatchDay.numberOfMatchDay + 1 == 1) {
      return true;
    } else {
      return false;
    }
  }

  isTheLast(): boolean {
    const days = this.tournamentService.currentTournament.value.matchDays;
    return !this.lastMatchDay || days.findIndex(day => day.idMatchDay === this.lastMatchDay.idMatchDay) === days.length - 1;
  }
}
