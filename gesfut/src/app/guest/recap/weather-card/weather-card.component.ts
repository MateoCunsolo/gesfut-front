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
        this.conditionText = this.day.condition.text;
      } else {
        this.conditionText = 'Condición desconocida';
      }
      console.log("Traducción aplicada:", this.conditionText);
    }
  }
  
  

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