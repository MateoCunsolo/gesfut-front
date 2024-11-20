import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TestSweetComponent } from "../../test-sweet/test-sweet.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, TestSweetComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})

export class LandingComponent {

  constructor(private router: Router) { }

  toRegister() {
    this.router.navigate(['/auth/singup']);
  }
}
