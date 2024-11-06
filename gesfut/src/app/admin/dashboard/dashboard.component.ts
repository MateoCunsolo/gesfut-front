import { Router } from '@angular/router';
import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
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

  @Output() activeComponent = new EventEmitter<string>();

  changeComponent(component:string) {
    this.activeComponent.emit(component);
  }

  constructor(private router: Router) {} 

  navigateTo(route:String) {
    this.router.navigate([`/admin/${route}`]);
  }
}
  