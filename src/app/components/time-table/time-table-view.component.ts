import { Component, OnInit } from '@angular/core';
import { TimeTableService } from '../../services/timeTable.service';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
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
  classStatus?: 'Scheduled' | 'Cancelled';
  [key: string]: any;
}

interface UserProfile {
  role: string;
  batch?: string;
  medium?: string;
  subscription?: string;
  _id?: string;
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
  teachersCache: { [key: string]: string } = {}; // cache id => name
  userRole: string = '';
  userProfile?: UserProfile;

  constructor(
    private timeTableService: TimeTableService,
    private authService: AuthService,
    private studentService: StudentService,
    private teacherService: TeacherService,
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
        } else if (this.userRole === 'TEACHER') {
          if (profile._id) {
            this.loadTimeTablesforTeacher(profile._id!); // new method
          } else {
            console.error('Teacher profile _id is undefined');
          }
        }

      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
  }

  // Admin - all timetables (✅ filtered by current month)
  private loadTimeTables(): void {
    this.timeTableService.getTimeTables().subscribe(
      (data: TimeTable[]) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // ✅ Filter timetables for current month only
        this.timeTables = data.filter((tt: any) => {
          const startDate = new Date(tt.weekStartDate);
          const endDate = new Date(tt.weekEndDate);
          return (
            (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
            (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear)
          );
        });

        this.preloadTeacherNames(this.timeTables); // ✅ preload teacher names
      },
      (error) => console.error('Error fetching timetables', error)
    );
  }

  // Student - only their timetable (✅ filtered by current month)
  private loadTimeTablesforStudent(batch: string, medium: string, plan: string): void {
    this.timeTableService.getTimeTablesbyBatchMediumPlan(batch, medium, plan).subscribe(
      (data: TimeTable[]) => {
        //console.log('Student timetable fetched:', data);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // ✅ Filter timetables for current month only
        this.timeTables = data.filter((tt: any) => {
          const startDate = new Date(tt.weekStartDate);
          const endDate = new Date(tt.weekEndDate);
          return (
            (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
            (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear)
          );
        });

        this.preloadTeacherNames(this.timeTables); // ✅ also preload for student timetables
      },
      (error) => console.error('Error fetching student timetable', error)
    );
  }
  private loadTimeTablesforTeacher(teacherId: string): void {
    this.timeTableService.getTimeTablesByTeacher(teacherId).subscribe({
      next: (data: TimeTable[]) => {
        //console.log('Teacher timetable fetched:', data);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // ✅ Filter timetables for current month only
        this.timeTables = data.filter((tt: any) => {
          const startDate = new Date(tt.weekStartDate);
          const endDate = new Date(tt.weekEndDate);
          return (
            (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
            (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear)
          );
        });

        this.preloadTeacherNames(this.timeTables); // ✅ also preload teacher names
      },
      error: (error) => console.error('Error fetching teacher timetable', error)
    });
  }


  // ✅ Preload teacher names (Option 2)
  private preloadTeacherNames(timeTables: TimeTable[]): void {
    const teacherIds = [...new Set(timeTables.map(tt => tt.assignedTeacher))];

    teacherIds.forEach(id => {
      if (!this.teachersCache[id]) {
        this.teacherService.getTeacherById(id).subscribe({
          next: (teacher) => {
            // based on backend structure { success, data: { name } }
            this.teachersCache[id] = teacher.data.name;
          },
          error: (err) => console.error('Error fetching teacher', err)
        });
      }
    });
  }

  findTeacherByID(assignedTeacher: string): string {
    return this.teachersCache[assignedTeacher] || 'Loading...';
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
