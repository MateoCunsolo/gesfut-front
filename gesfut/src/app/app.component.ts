import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { NavbarComponent } from "./admin/navbar/navbar.component";
import { ListTeamsComponent } from "./admin/list-teams/list-teams.component";
import { DashboardService } from './core/services/dashboard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NavbarComponent, ListTeamsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gesfut-front';

  ngOnInit(): void {
    window.addEventListener('popstate', (event: PopStateEvent) => {
      if (event.state) {
        window.location.reload();
      }
    });
  }
}
