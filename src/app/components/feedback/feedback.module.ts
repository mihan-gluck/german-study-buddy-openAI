import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedbackFormComponent } from './feedback-form.component';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: FeedbackFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'STUDENT' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRoutingModule {}
