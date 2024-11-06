import { Component, inject } from '@angular/core';
import { AdminService } from '../../core/services/manager/admin.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  private route = inject(Router);
  private activedRoute = inject(ActivatedRoute);
  code = '';
  

  ngOnInit(): void {
    this.code = this.activedRoute.snapshot.paramMap.get('code') || '';
  }

  

  toRoute(route: string){
    if(route === 'teams'){
      this.route.navigate(['/admin/tournaments/' + this.code + '/' + route]);
    }else if(route === 'clasification'){
      this.route.navigate(['/admin/tournaments/' + this.code + '/' + route]);
    }else if(route === 'match-days'){
      this.route.navigate(['/admin/tournaments/' + this.code + '/' + route]);
    }else if(route === 'awards'){
      this.route.navigate(['/admin/tournaments/' + this.code]);
    }else if(route === 'photos'){
      this.route.navigate(['/admin/tournaments/' + this.code + '/' + route]);
    }
  }


}