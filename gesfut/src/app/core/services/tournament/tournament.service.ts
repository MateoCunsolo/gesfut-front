import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  url=environment.apiUrl;

  constructor(private http:HttpClient) { }

  tournamentExists(code:String):Observable<boolean>{
    return this.http.get<boolean>(`${this.url}/tournaments/exist/${code}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }
}
