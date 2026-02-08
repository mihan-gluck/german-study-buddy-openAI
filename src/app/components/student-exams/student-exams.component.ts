// src/app/components/student-exams/student-exams.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentAssignmentsComponent } from '../student-assignments/student-assignments.component';
import { StudentAssignedAssignmentsComponent } from '../student-assigned-assignments/student-assigned-assignments.component';
import { StudentNotificationsComponent } from '../student-notifications/student-notifications.component';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [
    CommonModule,
    StudentAssignmentsComponent,
    StudentAssignedAssignmentsComponent,
    StudentNotificationsComponent,
  ],
  templateUrl: './student-exams.component.html',
  styleUrls: ['./student-exams.component.css'],
})
export class StudentExamsComponent {
  currentCourseId!: string | null;
  currentModuleId!: string | null;
}
