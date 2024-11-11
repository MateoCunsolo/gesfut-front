import { Routes } from '@angular/router';
import { tournamentExistsGuard } from '../core/guards/tournamentExists.guard'; // Asegúrate de que la ruta es correcta
import { AdminPageComponent } from '../pages/admin-page/admin-page.component';
import { AdminTournamentPageComponent } from '../pages/admin-tournament-page/admin-tournament-page.component';
import { LoadResultComponent } from './load-result/load-result.component';
import { ListTeamsComponent } from './list-teams/list-teams.component';


export const ADMIN_ROUTES: Routes = [
    {
        path: '', component: AdminPageComponent
    },
    {
        path: 'prueba', component:LoadResultComponent
    },
    {
        path: 'teams', component: ListTeamsComponent
    },
    {
        path: 'tournaments/:code', 
        component: AdminTournamentPageComponent, 
        canActivate: [tournamentExistsGuard]
    },
    {
        path: '**', redirectTo: ''
    }
    
];
