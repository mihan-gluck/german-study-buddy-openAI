import { NgModule } from '@angular/core';
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
export class TeacherDashboardModule {}


