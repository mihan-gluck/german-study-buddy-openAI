//src/app/components/teacher-dashboard/teacher-dashboard.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../../shared/material.module';
import { NgChartsModule } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


const routes: Routes = [
  { path: '', component: TeacherDashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatProgressBarModule,
    MaterialModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    TeacherDashboardComponent
  ]
})
export class TeacherDashboardModule {}


/* import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { TeacherRoutingModule } from './teacher-routing.module';

@NgModule({
  declarations: [TeacherDashboardComponent], // Declare the component here
  imports: [
    CommonModule, 
    TeacherRoutingModule // Ensure the routing module is properly set up
  ],
  exports: [TeacherDashboardComponent] // Export if needed
})
export class TeacherDashboardModule {} */


