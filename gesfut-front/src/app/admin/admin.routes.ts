import { Component } from '@angular/core';

import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateTeamComponent } from './create-team/create-team.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '', component:DashboardComponent
    },
    {
        path: 'crear-equipo', component:CreateTeamComponent 
    }
    ,
    {
        path: '**', redirectTo:''
    }
];


