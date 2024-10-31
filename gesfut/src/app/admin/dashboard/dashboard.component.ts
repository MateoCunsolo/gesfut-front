import { Router } from '@angular/router';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  constructor(private router: Router) {} 

  goToTournaments() {
    this.router.navigate(['/admin/tournaments']);
  }
}
