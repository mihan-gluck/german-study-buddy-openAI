// src/app/components/teacher-dashboard/teacher-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {

  students: any[] = [];
  filteredStudents: any[] = [];

  filters: any = {
    level: '',
    plan: '',
    batch: null
  };

  constructor(
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.fetchStudents();
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
