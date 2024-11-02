import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  ngOnInit(): void {
    const nav = document.querySelector('nav') as HTMLElement;
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/tournaments') {
    
    }

  }
}