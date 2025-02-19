import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {


  private apiKey = environment.apiKeyWeather;
  private baseUrl = environment.baseUrlWeather;
      
  constructor(private http: HttpClient) {}

  getForecast(location: string, days: number): Observable<any> {
    const url = `${this.baseUrl}?key=${this.apiKey}&q=${location}&days=${days}&aqi=no&alerts=no&lang=es`;
    console.log(url);
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
