
import { Router } from '@angular/router';
import { SessionService } from './../../core/services/session.service';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  isLoggedIn: boolean = false;
  name:String='';

  constructor(private sessionService: SessionService, private route:Router) {}

  ngOnInit(): void {
    this.sessionService.userLoginOn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
    this.sessionService.userData.subscribe((userData) => {
      this.name=userData.name;
    })
  }

  onLogin(): void {
    this.route.navigateByUrl('/auth/login')
  }

  onLogout(): void {
    this.sessionService.clearUserSession();
    this.route.navigateByUrl('/');
  }

}
