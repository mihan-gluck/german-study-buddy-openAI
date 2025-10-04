import { Component, OnInit } from '@angular/core';
import { TimeTableService } from '../../services/timeTable.service';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

interface TimeTable {
  _id?: string;
  batch: string;
  medium: string;
  plan: string;   
  weekStartDate: Date;
  weekEndDate: Date;
  assignedTeacher: string;
  monday?: { start: string; end: string }[];
  tuesday?: { start: string; end: string }[];
  wednesday?: { start: string; end: string }[];
  thursday?: { start: string; end: string }[];
  friday?: { start: string; end: string }[];
  saturday?: { start: string; end: string }[];
  sunday?: { start: string; end: string }[];
  [key: string]: any;
}

interface UserProfile {
  role: string;
  batch?: string;
  medium?: string;
  subscription?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-time-table-view',
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  standalone: true,
  templateUrl: './time-table-view.component.html',
  styleUrls: ['./time-table-view.component.css']
})
export class TimeTableViewComponent implements OnInit {
  timeTables: TimeTable[] = [];
  userRole: string = '';
  userProfile?: UserProfile;

  constructor(
    private timeTableService: TimeTableService,
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Load user profile and then timetables based on role
  private loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
        this.userRole = profile.role;

        if (this.userRole === 'STUDENT') {
          this.loadTimeTablesforStudent(profile.batch!, profile.medium!, profile.subscription!);
        } else if (this.userRole === 'ADMIN') {
          this.loadTimeTables();
        }
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
  }

  // Admin - all timetables
  private loadTimeTables(): void {
    this.timeTableService.getTimeTables().subscribe(
      (data: TimeTable[]) => (this.timeTables = data),
      (error) => console.error('Error fetching timetables', error)
    );
  }

  // Student - only their timetable
  private loadTimeTablesforStudent(batch: string, medium: string, plan: string): void {
    this.timeTableService.getTimeTablesbyBatchMediumPlan(batch, medium, plan).subscribe(
      (data: TimeTable[]) => {
        console.log('Student timetable fetched:', data);
        this.timeTables = data;
      },
      (error) => console.error('Error fetching student timetable', error)
    );
  }

  groupByWeek(timeTables: TimeTable[], forStudent: boolean = false): { week: string; items: TimeTable[] }[] {
    const groups: { [key: string]: TimeTable[] } = {};

    for (const tt of timeTables) {
        let key = new Date(tt.weekStartDate).toDateString() + '_' + new Date(tt.weekEndDate).toDateString();

        // For STUDENT, include batch/medium/plan in key so only their timetable is counted
        if (forStudent) {
        key += `_${tt.batch}_${tt.medium}_${tt.plan}`;
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(tt);
    }

    return Object.keys(groups).map(k => ({ week: k, items: groups[k] }));
}

}
