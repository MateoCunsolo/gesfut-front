import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})

export class LandingComponent {
  selectedTabIndex = 0; // Indica que el primer tab (INICIO) está seleccionado
  selectTab(index: number): void {
    this.selectedTabIndex = index; // Cambia el índice del tab seleccionado
  }
}
