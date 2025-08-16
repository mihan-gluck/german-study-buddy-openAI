// src/app/components/teacher-dashboard/teacher-routing.module.ts
//import { RoleGuard } from '../../guards/role.guard';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { AuthGuard } from '../../guards/auth.guard'; // Ensure this path is correct


const routes: Routes = [
  { path: '', component: TeacherDashboardComponent, canActivate: [AuthGuard] } // Protect the route
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    
  ],
  exports: [RouterModule]
})
export class TeacherRoutingModule {}
