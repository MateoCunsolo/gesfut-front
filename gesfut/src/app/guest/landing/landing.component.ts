import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-landing',
    imports: [RouterModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})

export class LandingComponent {
  /** Auditoria 22/10 (#20): acceso publico a un torneo con su codigo o el link compartido. */
  code = '';
  codeError = '';

  constructor(private router: Router) { }

  toRegister() {
    this.router.navigate(['/auth/signup']);
  }

  viewTournament() {
    const match = this.code.trim().match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (!match) { this.codeError = 'Pegá el código o el link completo que te compartieron.'; return; }
    this.router.navigate(['/', match[0].toLowerCase()]);
  }
}