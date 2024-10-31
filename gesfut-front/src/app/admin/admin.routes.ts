import { Component } from '@angular/core';

import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateTournamentComponent } from './create-tournament/create-tournament.component';
import { TournamentDashboardComponent } from './tournament-dashboard/tournament-dashboard.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '', component:DashboardComponent
    },
    {
        path: 'tournaments', component: CreateTournamentComponent
    },
    {
        path: 'tournaments/:code', component: TournamentDashboardComponent
    }
    ,
    {
        path: '**', redirectTo:''
    }
];


