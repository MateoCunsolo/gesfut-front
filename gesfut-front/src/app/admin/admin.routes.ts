import { Component } from '@angular/core';

import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '', component:DashboardComponent
    },
    {
        path: '**', redirectTo:''
    }
];


