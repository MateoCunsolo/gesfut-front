import { Router } from '@angular/router';
import { SessionService } from './../../core/services/session.service';
import { Component } from '@angular/core';
import { UserComponent } from '../../shared/user/user.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UserComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']  // Cambiado 'styleUrl' a 'styleUrls'
})
export class HeaderComponent {

  isLoggedIn: boolean = false;
  name: string = '';

  constructor(private sessionService: SessionService, private route: Router) { }


  ngOnInit(): void {
    this.sessionService.userLoginOn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
    this.sessionService.userData.subscribe((userData) => {
      this.name = userData.name;
    });
  }

  onLogin(): void {
    this.route.navigateByUrl('/auth/login');
  }
}
