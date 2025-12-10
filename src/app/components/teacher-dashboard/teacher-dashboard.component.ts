// src/app/components/teacher-dashboard/teacher-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../../services/teacher.service';
import { ElevenLabsUsageService } from '../../services/elevenlabs-usage.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: false,
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
    private teacherService: TeacherService,
    private elevenLabsService: ElevenLabsUsageService
  ) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  // ✅ Fetch students from backend via TeacherService
  fetchStudents(): void {
    this.teacherService.getAssignedStudents().subscribe({
      next: (res) => {
        this.students = res.data || [];

        // Load ElevenLabs usage for each student (like admin dashboard)
        this.students.forEach(student => this.loadElevenLabsUsage(student));

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

  loadElevenLabsUsage(student: any): void {

    this.elevenLabsService.getUsageByApiKeyForTeacher(student._id).subscribe({
      next: (res) => {
        if (res?.usage?.subscription) {
          const sub = res.usage.subscription;
          const used = sub.character_count || 0;
          const limit = sub.character_limit || 30000;
          const remaining = limit - used;

          student.remainingMinutes = limit ? Math.floor((remaining / limit) * 60) : 0;

          student.planUpgradeDate = sub.next_character_count_reset_unix
            ? new Date(sub.next_character_count_reset_unix * 1000).toISOString().slice(0, 10)
            : undefined;

          student.remainingDays = student.planUpgradeDate
            ? Math.ceil((new Date(student.planUpgradeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : undefined;
        }
      },
      error: (err) => {
        console.error(`Failed to load ElevenLabs usage for ${student.name}`, err);
        student.remainingMinutes = 0;
        student.planUpgradeDate = undefined;
        student.remainingDays = undefined;
      }
    });
  }


  
}
