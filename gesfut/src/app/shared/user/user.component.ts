import { Component, HostListener, OnDestroy } from '@angular/core';
import { SessionService } from '../../core/services/manager/session.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnDestroy {
  isMenuOpen = false;
  name: string = '';

  constructor(private sessionService: SessionService, private route: Router) {
    this.sessionService.userData.subscribe(data => {
      this.name = data.name;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toChangePasswordWithPassword(){
    this.route.navigateByUrl('/admin/change-password');
  }

  settings() {
    console.log('Abrir configuración');
  }

  onLogout(): void {
    this.sessionService.clearUserSession();
    this.route.navigateByUrl('/');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-container') && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  ngOnDestroy() {
    
  }
}
