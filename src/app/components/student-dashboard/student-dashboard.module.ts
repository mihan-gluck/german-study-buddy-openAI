import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardComponent } from './student-dashboard.component';
import { StudentRoutingModule } from './student-routing.module';

@NgModule({
  declarations: [StudentDashboardComponent],
  imports: [CommonModule, 
            StudentRoutingModule
        ],
  exports: [StudentDashboardComponent]
})
export class StudentDashboardModule {}


