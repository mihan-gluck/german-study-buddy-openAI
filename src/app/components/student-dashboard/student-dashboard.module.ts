//src/app/components/student-dashnoard/student-dashbaord.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardComponent } from './student-dashboard.component';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
//import { StudentRoutingModule } from './student-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from '../../shared/material.module';
import { NgChartsModule } from 'ng2-charts';


const routes: Routes = [
  { path: '', component: StudentDashboardComponent}
];

@NgModule({
  declarations: [
    StudentDashboardComponent,
    SafeUrlPipe,
  ],
  imports: [CommonModule,
            MatProgressBarModule,
            MatCardModule,
            RouterModule.forChild(routes),
            MaterialModule,
            NgChartsModule,
            //StudentRoutingModule
        ],
  exports: [StudentDashboardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]   // 👈 allow custom elements like <elevenlabs-convai>
})
export class StudentDashboardModule {}


