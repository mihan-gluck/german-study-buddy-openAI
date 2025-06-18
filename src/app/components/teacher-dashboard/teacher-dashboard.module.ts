//src/app/components/teacher-dashboard/teacher-dashboard.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: TeacherDashboardComponent }
];

@NgModule({
  declarations: [TeacherDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
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


