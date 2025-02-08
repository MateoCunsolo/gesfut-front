import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey = '67122adab4ce413788a215120250402'; // Tu API Key
  private baseUrl = 'https://api.weatherapi.com/v1/forecast.json'; // ¡Cambiamos a forecast.json!

  constructor(private http: HttpClient) {}

  getForecast(location: string, days: number): Observable<any> {
    const url = `${this.baseUrl}?key=${this.apiKey}&q=${location}&days=${days}&aqi=no&alerts=no`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error fetching weather data', error);
        throw error;
      })
    );
  }

  //obtener el clima anterior
  getHistoricalForecast(location: string, date: string): Observable<any> {
    const url = `${this.baseUrl}?key=${this.apiKey}&q=${location}&dt=${date}&aqi=no&alerts=no`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error fetching weather data', error);
        throw error;
      })
    );
  }

  //obtener una semana de clima atrás
  getWeekHistoricalForecast(location: string, date: string): Observable<any> {
    const url = `${this.baseUrl}?key=${this.apiKey}&q=${location}&dt=${date}&days=7&aqi=no&alerts=no`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error fetching weather data', error);
        throw error;
      })
    );
  }

}
