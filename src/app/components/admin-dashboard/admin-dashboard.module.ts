/* //src/app/components/student-dashnoard/admin-dashbaord.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
//import { StudentRoutingModule } from './student-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from '../../shared/material.module';
import { NgChartsModule } from 'ng2-charts';


const routes: Routes = [
  { path: '', component: AdminDashboardComponent}
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    SafeUrlPipe,
  ],
  imports: [CommonModule,
            MatProgressBarModule,
            MatCardModule,
            RouterModule,
            MaterialModule,
            NgChartsModule,
            FormsModule,
            //StudentRoutingModule
        ],
  exports: [AdminDashboardComponent]
})
export class AdminDashboardModule {}
*/

