//src/app/components/student-dashnoard/student-dashbaord.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardComponent } from './student-dashboard.component';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
//import { StudentRoutingModule } from './student-routing.module';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: '', component: StudentDashboardComponent}
];

@NgModule({
  declarations: [
    StudentDashboardComponent,
    SafeUrlPipe,
  ],
  imports: [CommonModule,
            
            RouterModule.forChild(routes) 
            //StudentRoutingModule
        ],
  exports: [StudentDashboardComponent]
})
export class StudentDashboardModule {}


