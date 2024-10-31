import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importa Router

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],  // Debe ser styleUrls en plural
})
export class DashboardComponent {
  constructor(private router: Router) {}  // Inyecta Router aquí

  goToTournaments() {
    this.router.navigate(['/admin/tournaments']);  // Usa this.router para navegar
  }
}
