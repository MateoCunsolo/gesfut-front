import { Component, OnInit } from '@angular/core';
import { MatchDaysService } from '../../core/services/tournament/match-days.service';
import { ActivatedRoute } from '@angular/router';
import { MatchDayResponse } from '../../core/models/tournamentResponse';
import { WeatherCardComponent } from './weather-card/weather-card.component';
import { WeatherService } from '../../core/services/weather-api/weather.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NgClass, NgIf } from '@angular/common';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { PublicPageComponent } from '../../pages/public-page/public-page.component';

@Component({
  selector: 'app-recap',
  imports: [WeatherCardComponent, SpinnerComponent, NgIf],
  templateUrl: './recap.component.html',
  styleUrl: './recap.component.scss',
})
export class RecapComponent {
  tournamentCode!: string;
  lastMatchDay!: MatchDayResponse;
  topScorers: { playerName: string; goals: number }[] = [];
  forecast: any;
  loadingWeather: boolean = false;
  isPreviousDayAvailable: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private matchDaysService: MatchDaysService,
    private weatherService: WeatherService,
    private tournamentService: TournamentService
  ) {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code');
      console.log(code);
      if (code) {
        this.tournamentCode = code;
        this.loadLastMatchDay(code);
      }
    });
  }

  verifyNextMatchDay() {
    if (this.lastMatchDay) {
      console.log('Verificando si la fecha siguiente tiene partidos cerrados...');
      if (
        this.lastMatchDay.isFinished &&
        this.lastMatchDay.matches.every((match) => match.isFinished)
      ) {
        this.tournamentService.currentTournament.subscribe({
          next: (response) => {
            //ecntrar el index del matchday actual
            const index = response.matchDays.findIndex(
              (matchDay) => matchDay.idMatchDay === this.lastMatchDay.idMatchDay
            );
            //ahora ver si la fecha siguiente tiene algun partido cerrado
            if(response.matchDays[index + 1]){
              if (response.matchDays[index + 1].matches.some((match) => match.isFinished)){
                console.log('La fecha siguiente tiene partidos cerrados.');
                this.lastMatchDay = response.matchDays[index + 1];
                this.loadTopScorers();
                this.getForecast();
                this.orderForDateMatchDay();
              } else {
                console.log('La fecha siguiente no tiene partidos cerrados.');
              }
            }else{
              console.log('No hay fecha siguiente.');
            }
          },
        });
      }
    }
  }

  loadLastMatchDay(code: string) {
    this.matchDaysService.getLastPlayedMatchDay(code).subscribe({
      next: (response: MatchDayResponse) => {
        this.lastMatchDay = response;
        this.loadTopScorers();
        this.getForecast();
        this.verifyNextMatchDay();
        this.orderForDateMatchDay();
      },
    });
  }

  loadTopScorers() {
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
  }

  getForecast() {
    if (
      !this.lastMatchDay ||
      !this.lastMatchDay.matches ||
      this.lastMatchDay.matches.length === 0
    ) {
      console.warn(
        '⚠️ No hay datos de partidos, no se puede obtener el pronóstico.'
      );
      this.loadingWeather = false;
      return;
    }

    const location = 'Mar del Plata';
    const targetDateTime = this.lastMatchDay.matches[0].dateTime;

    if (!targetDateTime) {
      console.warn(
        '⚠️ No hay fecha en el partido, no se puede obtener el pronóstico.'
      );
      this.loadingWeather = false;
      this.forecast = null;
      return;
    }

    const targetDate = this.formatDate(targetDateTime);

    if (!targetDate) {
      console.warn('⚠️ Fecha inválida, cancelando consulta.');
      return;
    }

    this.weatherService.getForecast(location, 14).subscribe((data) => {
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
          console.log('Fecha:', this.forecast.date),
          console.log(`Pronóstico promedio para ${targetDate}:`, this.forecast);
        } else {
          console.warn('La fecha solicitada no está disponible en la API.');
          this.isPreviousDayAvailable = true;
        }
      }
    });
    
  }

  formatDate(dateTime: string): string {
    // Expresión regular para extraer la fecha en español (ej: "jue 6 de feb 2025 | 14:00 hs")
    const regex = /(\d{1,2}) de (\w+) (\d{4})/;
    const match = dateTime.toLowerCase().match(regex);

    if (!match) {
      console.error('❌ Error: No se pudo extraer la fecha de:', dateTime);
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
      console.error('❌ Error: Mes no reconocido:', month);
      return '';
    }

    return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
  }

  formatHour(dateTime: string): string {
    const regex = /(\d{1,2}):(\d{2})/;
    const match = dateTime.match(regex);

    if (!match) {
      console.error('❌ Error: No se pudo extraer la hora de:', dateTime);
      return '';
    }

    return match[1].padStart(2, '0'); // Extrae la hora en formato HH
  }

  getMatchDayStatus() {
    let date: any;
    if (this.lastMatchDay.matches[0].dateTime == null) {
      date = '( no hay horarios definidos )';
    } else {
      date = this.lastMatchDay.matches[0].dateTime.split('|')[0].toUpperCase();
    }

    if (
      this.lastMatchDay.isFinished &&
      this.lastMatchDay.matches.every((match) => match.isFinished)
    ) {
      return (
        'RESUMEN DE LA FECHA Nº' + (this.lastMatchDay.numberOfMatchDay + 1)
      );
    }

    const anyMatchFinished = this.lastMatchDay.matches.some(
      (match) => match.isFinished
    );
    if (anyMatchFinished && !this.lastMatchDay.isFinished) {
      return (
        'FECHA Nº' +
        (this.lastMatchDay.numberOfMatchDay + 1) +
        ' JUGANDOSE ACTUALMENTE'
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
    const time = dateTimeString.split('|')[1].trim().split(' ')[0];
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

  nextMatchDay() {
    this.tournamentService.currentTournament.subscribe({
      next: (response) => {
        //ecntrar el index del matchday actual
        const index = response.matchDays.findIndex(
          (matchDay) => matchDay.idMatchDay === this.lastMatchDay.idMatchDay
        );
        this.lastMatchDay = response.matchDays[index + 1];
        this.loadTopScorers();
        this.getForecast();
      },
    });
    this.loadTopScorers();
    this.getForecast();
    this.orderForDateMatchDay();
  }

  previousMatchDay() {
    this.tournamentService.currentTournament.subscribe({
      next: (response) => {
        //ecntrar el index del matchday actual
        const index = response.matchDays.findIndex(
          (matchDay) => matchDay.idMatchDay === this.lastMatchDay.idMatchDay
        );
        this.lastMatchDay = response.matchDays[index - 1];
      },
    });
    this.loadTopScorers();
    this.getForecast();
    this.orderForDateMatchDay();
  }

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
    let isLast = false;
    this.tournamentService.currentTournament.subscribe({
      next: (response) => {
        if (
          this.lastMatchDay.numberOfMatchDay + 1 ==
          response.matchDays.length
        ) {
          isLast = true;
        }
      },
    });
    return isLast;
  }

  
}
