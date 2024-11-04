import { Component } from '@angular/core';

import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateTeamComponent } from './create-team/create-team.component';
import { CreateTournamentComponent } from './create-tournament/create-tournament.component';
import { TournamentDashboardComponent } from './tournament-dashboard/tournament-dashboard.component';
import { InitializeTournamentComponent } from './initialize-tournament/initialize-tournament.component';
import { ListMatchDaysComponent } from './list-match-days/list-match-days.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '', component:DashboardComponent
    },
    {
      path: 'crear-equipo', component:CreateTeamComponent 
    },
    {
        path: 'tournaments', component: CreateTournamentComponent
    },
    {
        path: 'tournaments/:code', component: TournamentDashboardComponent
    },
    {
        path: 'tournaments/:code/initialize', component: InitializeTournamentComponent
    }
    ,
    {
        path: 'tournaments/:code/match-days' , component: ListMatchDaysComponent
    }
    ,
    {
        path: '**', redirectTo:''
    }
];


