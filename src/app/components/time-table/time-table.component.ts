import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeTableService } from '../../services/timeTable.service';
import { AuthService } from '../../services/auth.service';

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
  [key: string]: any;
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
  isEditMode = false; // ✅ flag to track update mode
  timeTableId: string | null = null;

  constructor(
    private timeTableService: TimeTableService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if an ID is passed in route → Edit mode
    this.timeTableId = this.route.snapshot.paramMap.get('id');
    if (this.timeTableId) {
      this.isEditMode = true;
      this.loadTimeTableById(this.timeTableId);
    }
  }

  // ✅ Load teachers dynamically based on selected medium
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

  // ✅ Load existing timetable for update
  private loadTimeTableById(id: string): void {
    this.timeTableService.getTimeTableById(id).subscribe({
      next: (data) => {
        this.timeTable = data;
        this.medium = data.medium; // set medium dropdown
        this.loadTeachers(); // load teachers for that medium
      },
      error: (err) => {
        console.error('Failed to load timetable for edit', err);
      }
    });
  }

  addTimeSlot(day: keyof TimeTable): void {
    if (!this.timeTable[day]) {
      this.timeTable[day] = [];
    }
    (this.timeTable[day] as TimeRange[]).push({ start: '', end: '' });
  }

  removeTimeSlot(day: keyof TimeTable, index: number): void {
    (this.timeTable[day] as TimeRange[]).splice(index, 1);
  }

  // ✅ Submit form - create or update
  createTimeTable(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.timeTable.medium = this.medium;

    if (this.isEditMode && this.timeTableId) {
      // 🟡 Update existing timetable
      this.timeTableService.updateTimeTable(this.timeTableId, this.timeTable).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = 'Time table updated successfully!';
          this.router.navigate(['/time-table-view-admin']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Failed to update timetable.';
          console.error('❌ Update failed:', err);
        }
      });
    } else {
      // 🟢 Create new timetable
      this.timeTableService.addTimeTable(this.timeTable).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = 'Time table created successfully!';
          this.router.navigate(['/time-table-view-admin']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Failed to create timetable.';
          console.error('❌ Creation failed:', err);
        }
      });
    }
  }
}
