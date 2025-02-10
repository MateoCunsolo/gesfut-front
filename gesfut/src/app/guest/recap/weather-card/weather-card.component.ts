import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-weather-card',
  template: `
 <div class="weather-card">
  
  <div class="day">
    <h3>{{day.date}}</h3>
  </div>

  <div class="temps">
    <p>MAX: {{ day.maxTemp }}°</p>
    <p>MIN: {{ day.minTemp }}°</p>
  </div>

  
  <p>🌬 VIENTO: {{ day.wind_kph }} KM/H</p>
  <p>🌧 PROB. LLUVIA: {{ day.chance_of_rain }}%</p>

  <section class="condition">
    <img src="{{day.condition.icon}}"><img>
    <p class="text-conditio">{{conditionText}}</p>
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
  conditionText: string = 'Cargando condicion...';
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day'] && changes['day'].currentValue) {
      this.day = changes['day'].currentValue;
      this.day.date = this.getDayName(this.day.date) + ' ' + this.getNumberDay(this.day.date) + ' DE ' + this.getMonthName(this.day.date);
      if (this.day.condition?.text) {
        const key = this.day.condition.text.trim().toUpperCase();
        console.log("Clave para traducción:", key);
        this.conditionText = this.weatherTranslations[key] || this.day.condition.text;
      } else {
        this.conditionText = 'Condición desconocida';
      }
      console.log("Traducción aplicada:", this.conditionText);
    }
  }
  
  weatherTranslations: { [key: string]: string } = {
    'SUNNY': 'SOLEADO',
    'CLOUDY': 'NUBLADO',
    'OVERCAST': 'CUBIERTO',
    'MIST': 'NIEBLA',
    'PATCHY RAIN POSSIBLE': 'POSIBLE LLUVIA IRREGULAR',
    'PATCHY SNOW POSSIBLE': 'POSIBLE NIEVE IRREGULAR',
    'PATCHY SLEET POSSIBLE': 'POSIBLE AGUANIEVE',
    'PATCHY FREEZING DRIZZLE POSSIBLE': 'POSIBLE LLOVIZNA HELADA',
    'THUNDERY OUTBREAKS POSSIBLE': 'POSIBLES TORMENTAS ELÉCTRICAS',
    'BLOWING SNOW': 'VENTISCA',
    'BLIZZARD': 'TORMENTA DE NIEVE',
    'FOG': 'NIEBLA',
    'FREEZING FOG': 'NIEBLA HELADA',
    'PATCHY LIGHT DRIZZLE': 'LLOVIZNA LIGERA',
    'LIGHT DRIZZLE': 'LLOVIZNA',
    'FREEZING DRIZZLE': 'LLOVIZNA HELADA',
    'HEAVY FREEZING DRIZZLE': 'LLOVIZNA HELADA FUERTE',
    'PATCHY LIGHT RAIN': 'LLUVIA LIGERA IRREGULAR',
    'LIGHT RAIN': 'LLUVIA LIGERA',
    'MODERATE RAIN AT TIMES': 'LLUVIA MODERADA A VECES',
    'MODERATE RAIN': 'LLUVIA MODERADA',
    'HEAVY RAIN AT TIMES': 'LLUVIA FUERTE A VECES',
    'HEAVY RAIN': 'LLUVIA FUERTE',
    'LIGHT FREEZING RAIN': 'LLUVIA HELADA LIGERA',
    'MODERATE OR HEAVY FREEZING RAIN': 'LLUVIA HELADA MODERADA O FUERTE',
    'LIGHT SLEET': 'AGUANIEVE LIGERA',
    'MODERATE OR HEAVY SLEET': 'AGUANIEVE MODERADA O FUERTE',
    'PATCHY LIGHT SNOW': 'NIEVE LIGERA IRREGULAR',
    'LIGHT SNOW': 'NIEVE LIGERA',
    'PATCHY MODERATE SNOW': 'NIEVE MODERADA IRREGULAR',
    'MODERATE SNOW': 'NIEVE MODERADA',
    'PATCHY HEAVY SNOW': 'NIEVE FUERTE IRREGULAR',
    'HEAVY SNOW': 'NIEVE FUERTE',
    'ICE PELLETS': 'GRANIZO',
    'LIGHT RAIN SHOWER': 'CHUBASCO LIGERO',
    'MODERATE OR HEAVY RAIN SHOWER': 'CHUBASCO MODERADO O FUERTE',
    'TORRENTIAL RAIN SHOWER': 'CHUBASCO TORRENCIAL',
    'LIGHT SLEET SHOWERS': 'CHUBASCOS DE AGUANIEVE LIGEROS',
    'MODERATE OR HEAVY SLEET SHOWERS': 'CHUBASCOS DE AGUANIEVE MODERADOS O FUERTES',
    'LIGHT SNOW SHOWERS': 'CHUBASCOS DE NIEVE LIGEROS',
    'MODERATE OR HEAVY SNOW SHOWERS': 'CHUBASCOS DE NIEVE MODERADOS O FUERTES',
    'LIGHT SHOWERS OF ICE PELLETS': 'CHUBASCOS DE GRANIZO LIGEROS',
    'MODERATE OR HEAVY SHOWERS OF ICE PELLETS': 'CHUBASCOS DE GRANIZO MODERADOS O FUERTES',
    'PATCHY LIGHT RAIN WITH THUNDER': 'LLUVIA LIGERA IR REGULAR CON TORMENTA',
    'MODERATE OR HEAVY RAIN WITH THUNDER': 'LLUVIA MODERADA O FUERTE CON TORMENTA',
    'PATCHY LIGHT SNOW WITH THUNDER': 'NIEVE LIGERA IRREGULAR CON TORMENTA',
    'MODERATE OR HEAVY SNOW WITH THUNDER': 'NIEVE MODERADA O FUERTE CON TORMENTA',
  };

  getDayName(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    console.log("Fecha corregida:", date);
    return date.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
  }
  
  getNumberDay(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    return date.toLocaleDateString('es-ES', { day: 'numeric' });
  }
  
  getMonthName(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    return date.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
  }
  
}