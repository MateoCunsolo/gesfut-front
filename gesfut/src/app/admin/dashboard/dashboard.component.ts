import { Router } from '@angular/router';
import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {

  constructor(private dashboardService:DashboardService) {} 

  changeComponent(component:string) {
    this.dashboardService.setActiveDashboardAdminComponent(component);
  }
}
  