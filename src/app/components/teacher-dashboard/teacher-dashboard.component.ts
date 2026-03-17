// src/app/components/teacher-dashboard/teacher-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeacherAssignmentsComponent } from '../teacher-assignments/teacher-assignments.component';
import { TeacherNotificationsComponent } from '../teacher-notifications/teacher-notifications.component';
import { TeacherAssignmentTemplatesComponent } from '../teacher-assignment-templates/teacher-assignment-templates.component';


@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TeacherAssignmentsComponent, TeacherNotificationsComponent, TeacherAssignmentTemplatesComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {

  students: any[] = [];
  filteredStudents: any[] = [];
  currentUser: any = null;

  filters: any = {
    level: '',
    plan: '',
    batch: null
  };

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.fetchStudents();
  }

  // Load current user to check role
  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
  }

  // Check if user is TEACHER_ADMIN
  isTeacherAdmin(): boolean {
    return this.currentUser?.role === 'TEACHER_ADMIN';
  }

  // ✅ Fetch students from backend via TeacherService
  fetchStudents(): void {
    this.teacherService.getAssignedStudents().subscribe({
      next: (res) => {
        this.students = res.data || [];

        // Students loaded successfully
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to fetch students:', err);
      }
    });
  }


  // ✅ Apply filters for Level, Plan, and Batch
  applyFilters(): void {
    this.filteredStudents = this.students.filter(student => {
      return (
        (!this.filters.level || student.level === this.filters.level) &&
        (!this.filters.plan || student.subscription === this.filters.plan.toUpperCase()) &&
        (!this.filters.batch || +student.batch === +this.filters.batch)
      );
    });
  }

  // ✅ For *ngFor trackBy
  trackById(index: number, student: any): string {
    return student._id;
  }
}
