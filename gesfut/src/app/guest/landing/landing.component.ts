import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ListTeamsComponent } from "../../admin/list-teams/list-teams.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, ListTeamsComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})

export class LandingComponent {

  constructor(private router: Router) { }

  toRegister() {
    this.router.navigate(['/auth/singup']);
  }
}
