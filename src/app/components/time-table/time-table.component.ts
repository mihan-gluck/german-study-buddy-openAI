// src/app/components/time-table/time-table.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TimeTableService } from '../../services/timeTable.service';
import { AuthService } from '../../services/auth.service'; // Service to fetch teachers

interface Teacher {
  _id: string;
  name: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface TimeTable {
  _id?: string;
  batch: string;
  medium: string;
  plan: string;
  weekStartDate: Date;
  weekEndDate: Date;
  assignedTeacher: string;
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
  [key: string]: any; // allows indexing like timeTable[day]
}

@Component({
  selector: 'app-time-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.css']
})
export class TimeTableComponent implements OnInit {
  teachers: Teacher[] = [];

  // Days of the week for iteration in template
  daysOfWeek: (keyof TimeTable)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  medium: string = '';

  timeTable: TimeTable = {
    batch: '',
    medium: '',
    plan: '',
    weekStartDate: new Date(),
    weekEndDate: new Date(),
    assignedTeacher: '',
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private timeTableService: TimeTableService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // optionally fetch initial data if needed
  }

  // Load teachers dynamically based on selected medium
  loadTeachers(): void {
    if (!this.medium) {
      this.teachers = [];
      return;
    }

    this.authService.getTeachersByMedium(this.medium).subscribe({
      next: (data) => this.teachers = data,
      error: (err) => {
        console.error('Failed to load teachers', err);
        this.teachers = [];
      }
    });
  }

  // Add a time slot for a specific day
  addTimeSlot(day: keyof TimeTable): void {
    if (!this.timeTable[day]) {
      this.timeTable[day] = [];
    }
    (this.timeTable[day] as TimeRange[]).push({ start: '', end: '' });
  }

  // Remove a time slot
  removeTimeSlot(day: keyof TimeTable, index: number): void {
    (this.timeTable[day] as TimeRange[]).splice(index, 1);
  }

  // Submit the time table
  createTimeTable(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.timeTable.medium = this.medium;

    console.log('📝 Submitting timetable:', this.timeTable);

    this.timeTableService.addTimeTable(this.timeTable).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Time table created successfully!';
        this.router.navigate(['/time-table']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create timetable.';
        console.error('❌ Timetable creation failed:', err);
      }
    });
  }
}
