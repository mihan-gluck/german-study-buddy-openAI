import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeTableComponent } from './time-table.component';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: TimeTableComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeTableRoutingModule {}
