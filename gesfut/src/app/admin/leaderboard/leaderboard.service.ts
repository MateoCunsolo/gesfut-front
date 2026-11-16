import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { environment } from '../../../enviroments/environment';
import { TopScorerResponse } from '../../core/models/topScorersResponse';
import { TopYellowCardResponse } from '../../core/models/topYellowCardsResponse';
import { TopRedCardsResponse } from '../../core/models/topRedCardsResponse';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private http: HttpClient) {}
  url = environment.apiUrl;
  private readonly noCache = { headers: new HttpHeaders({ 'Cache-Control': 'no-cache', Pragma: 'no-cache', 'ngsw-bypass': 'true' }) };

  getTopScorers(code: string): Observable<TopScorerResponse[]> {
    return this.http.get<TopScorerResponse[]>(`${this.url}/tournaments/${code}/top-scorers`, this.noCache);
  }

  getYellowCard(code: string): Observable<TopYellowCardResponse[]> {
    return this.http.get<TopYellowCardResponse[]>(`${this.url}/tournaments/${code}/top-yellow-cards`, this.noCache);
  }

  getTopRedCards(code: string): Observable<TopRedCardsResponse[]> {
    return this.http.get<TopRedCardsResponse[]>(`${this.url}/tournaments/${code}/top-red-cards`, this.noCache);
  }
}
