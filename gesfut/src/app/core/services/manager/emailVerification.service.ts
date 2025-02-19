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
  private API_URL = `${environment.baseUrlEmailVerification}=${this.API_KEY}&smtp=1&format=1&email=`;
  constructor(private http: HttpClient) {}
  validateEmail(email: string): Observable<boolean> {
    console.log(this.API_URL);
    return this.http.get<any>(`${this.API_URL}${email}`).pipe(
      map((response) => {
        console.log(response);
        return (
          response.mx_found &&     
          response.score > 0.3    
        );
      })
    );
  }
}
