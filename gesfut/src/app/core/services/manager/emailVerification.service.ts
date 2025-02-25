import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationService {
  private API_KEY = environment.apiKeyEmailVerification;
  private API_URL = environment.baseUrlEmailVerification;
  constructor(private http: HttpClient) {}
  validateEmail(email: string): Observable<boolean> {
    return this.http.get<any>(`${this.API_URL}${email}&api_key=${this.API_KEY}`).pipe(
      map((response) => {
        if (response.data.status === 'valid') {
          return true;
        }
        return false;
    }));
  }
}