import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatTabsModule, MatButtonModule, RouterLink, MatToolbarModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})

export class LandingComponent {
  selectedTabIndex = 0; // Indica que el primer tab (INICIO) está seleccionado
  selectTab(index: number): void {
    this.selectedTabIndex = index; // Cambia el índice del tab seleccionado
  }
}
