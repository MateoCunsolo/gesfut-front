import { Router } from '@angular/router';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  constructor(private router: Router) {} 

  navigateTo(route:String) {
    this.router.navigate([`/admin/${route}`]);
  }
}
