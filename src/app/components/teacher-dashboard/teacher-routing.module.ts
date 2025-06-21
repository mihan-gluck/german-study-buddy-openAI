
//import { RoleGuard } from '../../guards/role.guard';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { AuthGuard } from '../../guards/auth.guard'; // Ensure this path is correct
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: TeacherDashboardComponent, canActivate: [AuthGuard] } // Protect the route
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    MatProgressBarModule,
    FormsModule,

  ],
  exports: [RouterModule]
})
export class TeacherRoutingModule {}
