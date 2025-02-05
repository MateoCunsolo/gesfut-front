import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-weather-card',
  template: `
 <div class="weather-card">
  
  <div class="day">
    <h3>{{ getDayName(day.time) }} {{getNumberDay(day.time)}} {{getMonthName(day.time)}} </h3>
  </div>

  <div class="temps">
    <p>MAX: {{ day.maxTemp }}°</p>
    <p>MIN: {{ day.minTemp }}°</p>
  </div>

  
  <p>🌬 VIENTO: {{ day.wind_kph }} KM/H</p>
  <p>🌧 PROB. LLUVIA: {{ day.chance_of_rain }}%</p>

  <section class="condition">
    <img src="{{day.condition.icon}}"><img>
    <p class="text-conditio">{{ translateCondition(day.condition.text).toLocaleUpperCase() }}</p>
  </section>

</div>

  `,
  styles: [
    `
      .text-condition{
        color: white;
      }

      .condition{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: start;
      }

      .day{
        width: 100%;
        text-align: start;
        color: white;
      }

      .weather-card {
        background: var(--primary-color);
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        font-size: var(--font-size-text);
        border: solid var(--secondary-color) 1px;
        gap:10px;
        color: white;
      }

      .temp{
        font-size: var(--font-size-title);
        margin: 0;
      }


      h3 {
        margin: 0;
        font-size: 1.5rem;
        color: white;
      }

      p {
        margin: 5px 0;
        font-size: 1.5rem;
      }

      .condition {
        text-transform: capitalize;
      }
    `
  ]
})
export class WeatherCardComponent implements OnChanges {
  @Input() day: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day'].previousValue !== changes['day'].currentValue) {
      this.day = changes['day'].currentValue;
      console.log(this.day);
    }

  }



  weatherTranslations: { [key: string]: string } = {
    'Sunny': 'Soleado',
    'Partly cloudy': 'Parcialmente nublado',
    'Cloudy': 'Nublado',
    'Overcast': 'Cubierto',
    'Mist': 'Niebla',
    'Patchy rain possible': 'Posible lluvia irregular',
    'Patchy snow possible': 'Posible nieve irregular',
    'Patchy sleet possible': 'Posible aguanieve',
    'Patchy freezing drizzle possible': 'Posible llovizna helada',
    'Thundery outbreaks possible': 'Posibles tormentas eléctricas',
    'Blowing snow': 'Ventisca',
    'Blizzard': 'Tormenta de nieve',
    'Fog': 'Niebla',
    'Freezing fog': 'Niebla helada',
    'Patchy light drizzle': 'Llovizna ligera',
    'Light drizzle': 'Llovizna',
    'Freezing drizzle': 'Llovizna helada',
    'Heavy freezing drizzle': 'Llovizna helada fuerte',
    'Patchy light rain': 'Lluvia ligera irregular',
    'Light rain': 'Lluvia ligera',
    'Moderate rain at times': 'Lluvia moderada a veces',
    'Moderate rain': 'Lluvia moderada',
    'Heavy rain at times': 'Lluvia fuerte a veces',
    'Heavy rain': 'Lluvia fuerte',
    'Light freezing rain': 'Lluvia helada ligera',
    'Moderate or heavy freezing rain': 'Lluvia helada moderada o fuerte',
    'Light sleet': 'Aguanieve ligera',
    'Moderate or heavy sleet': 'Aguanieve moderada o fuerte',
    'Patchy light snow': 'Nieve ligera irregular',
    'Light snow': 'Nieve ligera',
    'Patchy moderate snow': 'Nieve moderada irregular',
    'Moderate snow': 'Nieve moderada',
    'Patchy heavy snow': 'Nieve fuerte irregular',
    'Heavy snow': 'Nieve fuerte',
    'Ice pellets': 'Granizo',
    'Light rain shower': 'Chubasco ligero',
    'Moderate or heavy rain shower': 'Chubasco moderado o fuerte',
    'Torrential rain shower': 'Chubasco torrencial',
    'Light sleet showers': 'Chubascos de aguanieve ligeros',
    'Moderate or heavy sleet showers': 'Chubascos de aguanieve moderados o fuertes',
    'Light snow showers': 'Chubascos de nieve ligeros',
    'Moderate or heavy snow showers': 'Chubascos de nieve moderados o fuertes',
    'Light showers of ice pellets': 'Chubascos ligeros de granizo',
    'Moderate or heavy showers of ice pellets': 'Chubascos moderados o fuertes de granizo',
    'Patchy light rain with thunder': 'Lluvia ligera irregular con tormenta',
    'Moderate or heavy rain with thunder': 'Lluvia moderada o fuerte con tormenta',
    'Patchy light snow with thunder': 'Nieve ligera irregular con tormenta',
    'Moderate or heavy snow with thunder': 'Nieve moderada o fuerte con tormenta'
  };

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
  }

  getNumberDay(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric' });
  }

  getMonthName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
  }

  translateCondition(condition: string): string {
    return this.weatherTranslations[condition] || condition;
  }

  analizeCondition(): string {
    const condition = this.day.condition.text;
    if (condition.includes('rain') || condition.includes('shower')) {
      return '🌧';
    } else if (condition.includes('snow') || condition.includes('sleet')) {
      return '❄️';
    } else if (condition.includes('thunder')) {
      return '⛈';
    } else if (condition.includes('cloud')) {
      return '☁️';
    } else if (condition.includes('sun')) {
      return '☀️';
    } else {
      return '🌫';
    }
  }

}

