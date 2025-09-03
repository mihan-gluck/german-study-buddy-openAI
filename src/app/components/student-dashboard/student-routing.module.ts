import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard.component';

const routes: Routes = [
  { path: '', component: StudentDashboardComponent } // Empty path means this is the default route when navigating to '/student-dashboard'
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class StudentRoutingModule {}

