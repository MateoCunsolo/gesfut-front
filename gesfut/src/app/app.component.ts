import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { PwaStatusComponent } from './shared/pwa-status/pwa-status.component';
import { FooterComponent } from "./shared/footer/footer.component";

@Component({
    selector: 'app-root',
    imports: [HeaderComponent, FooterComponent, RouterOutlet, PwaStatusComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gesfut-front';

  /** Plan 22/10 #10: "Saltar al contenido" mueve el foco al contenido sin tocar la URL ni el router. */
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView();
  }

  ngOnInit(): void {
    window.addEventListener('popstate', (event: PopStateEvent) => {
      if (event.state) {
        window.location.reload();
      }
    });
  }
}
