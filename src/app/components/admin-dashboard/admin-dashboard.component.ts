//src/app/components/admin-dashboard/admin-dashboard.component.ts

import { Component, OnInit, TrackByFunction } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { MaterialModule } from '../../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { AssignElevenlabsDialogComponent } from '../../assign-elevenlabs-dialog/assign-elevenlabs-dialog.component';
import { HttpHeaders } from '@angular/common/http';
import { ElevenLabsUsageService } from '../../services/elevenlabs-usage.service';
import {TeacherService} from '../../services/teacher.service';
import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;  // Base API URL

type VapiStatus = 'active' | 'paused' | 'finished';

interface CourseProgress {
  courseId?: string;
  courseName: string;
  progressPercentage: number;
  lastUpdated: string;
}

interface Student {
  editingElevenLabs: boolean;

  elevenLabsLink: any;
  student: { fluency: number; grammar: number; accent: number; overallCFBR: number; currentLevel: string; };
  _id: string;
  regNo?: string;
  name: string;
  email: string;
  batch?: string;
  medium?: string;
  courseAssigned: string;
  registeredAt: string;
  elevenLabsApiKey?: string;
  subscription: string;
  level: string;
  studentStatus: string;

  vapiAccess: {
    assistantId: any;
    status: VapiStatus;
    totalMonthlyUsage: number;
    apiKey?: string;
    assistantID?: string;
  };
  feedbackStats?: {
    currentLevel: string;
    fluency: number;
    grammar: number;
    accent: number;
    overallCFBR: number;
  };
  courseProgress?: CourseProgress[];

  remainingMinutes?: number;
  planUpgradeDate?: string;
  remainingDays?: number;
}

interface FeedbackEntry {
  timestamp: string;
  studentName: string;
  studentId: string;
  summary: string;
  conversationTime: number;
  fluency: string;
  accent: string;
  grammar: string;
  overallCfbr: string;
  commonMistakes: string;
  currentLevel: string;
  suggestedImprovement: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatCardModule,
    MaterialModule,
    NgChartsModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit {
  students: any[] = [];          // original data
  filteredStudents: any[] = [];  // shown in table
  selectedStudentIds = new Set<string>();

  loading = false;
  error = '';
  filters = { level: '', plan: '', batch: '', assignedTeacher: '', studentStatus: '' };
  plan: string[] = ['PLATINUM', 'SILVER'];
  level: string[] = ['A1', 'A2', 'B1', 'B2'];
  teachers: any[] = [];

  feedbackMap: Record<string, any[]> = {};
  selectedStudentName?: string;
  feedbackLoading: boolean = false;
  feedbackError: string | null = null;

  bulkCourseName: string = '';
  bulkAssistantId: string = '';
  bulkApiKey: string = '';
  selectedStudentId!: string;

  characterCount = 0;
  characterLimit = 0;
  remainingMinutes = 0;
  planUpgradeDate: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private feedbackService: FeedbackService,
    private dialog: MatDialog,
    private elevenLabsService: ElevenLabsUsageService,
    private teacherService: TeacherService,
  ) {}

  ngOnInit(): void {
    // ✅ Check user profile from backend (cookie included automatically)
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        if (user.role !== 'ADMIN') {
          this.router.navigate(['/dashboard']);
          return;
        }
        this.fetchStudents();
        this.fetchTeachers();
      },
      error: (err) => {
        //console.error('Not authenticated:', err);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  totalStudentsCount(): number {
    return this.students.length;
  }
  
  fetchStudents(): void {
    this.loading = true;

    this.http.get<{ success: boolean; data: Student[] }>(`${apiUrl}/admin/students`, { withCredentials: true }).subscribe({
      next: res => {
        if (res.success) {
          this.students = res.data;
          this.students.forEach(student => {
            //this.loadFeedbackStats(student);
            this.loadCourseProgress(student);
            this.loadElevenLabsUsage(student); // <-- pass single student
            //console.log('Student data:', student);
          });
          this.filteredStudents = [...this.students];
        } else {
          this.error = 'Failed to load students';
        }
        this.loading = false;
      },
      error: err => {
        //console.error('Error fetching students:', err);
        this.error = err.error?.msg || 'Failed to load students';
        this.loading = false;
      }
    });
    }

    // ✅ Fetch all registered teachers
    fetchTeachers(): void {
      this.teacherService.getAllTeachers()
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.teachers = res.data;
            } else {
              alert('Failed to load teachers');
            }
          },
          error: (err) => {
            //console.error('Error fetching teachers:', err);
          }
        });
    }

  filteredStudentCount: number = 0;

  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      const course = student.courseAssigned ? student.courseAssigned.toLowerCase() : '';
      const plan   = student.subscription ? student.subscription.toUpperCase() : '';
      const status = student.studentStatus ? student.studentStatus.toLowerCase() : '';
      const assignedTeacherName =
      typeof student.assignedTeacher === 'object'
        ? student.assignedTeacher.name?.toLowerCase()
        : student.assignedTeacher?.toLowerCase() || '';

      return (
        (!this.filters.level || student.level === this.filters.level) &&
        (!this.filters.plan   || plan === this.filters.plan.toUpperCase()) &&
        (!this.filters.batch || student.batch === this.filters.batch.toString()) &&
        (!this.filters.assignedTeacher || assignedTeacherName === this.filters.assignedTeacher.toLowerCase()) &&
        (!this.filters.studentStatus || status === this.filters.studentStatus.toLowerCase())
      );
    });

    this.filteredStudentCount = this.filteredStudents.length;
  }

  toggleStudentSelection(studentId: string): void {
    if (this.selectedStudentIds.has(studentId)) {
      this.selectedStudentIds.delete(studentId);
    } else {
      this.selectedStudentIds.add(studentId);
    }
  }

  bulkAssign(): void {
    if (!this.bulkCourseName || !this.bulkAssistantId || !this.bulkApiKey) {
      alert('All fields are required for bulk assignment.');
      return;
    }
    const studentIds = Array.from(this.selectedStudentIds);
    const body = {
      studentIds,
      courseName: this.bulkCourseName,
      assistantId: this.bulkAssistantId,
      apiKey: this.bulkApiKey
    };
    this.http.post('/api/admin/bulk-assign', body).subscribe({
      next: () => {
        alert('Bulk assignment successful');
        this.selectedStudentIds.clear();
        this.fetchStudents();
      },
      error: err => {
        //console.error('Bulk assignment failed', err);
        alert('Bulk assignment failed');
      }
    });
  }

  // loadFeedbackStats(student: Student): void {
  //   this.feedbackService.getStudentFeedback(student._id).subscribe({
  //     next: (feedbackList: FeedbackEntry[]) => {
  //       const getAvg = (key: 'fluency' | 'grammar' | 'accent' | 'overallCfbr'): number => {
  //         const scores = feedbackList
  //           .map(f => parseFloat(f[key] as string))
  //           .filter(n => !isNaN(n));
  //         return scores.length ? +(scores.reduce((a, b) => a + b) / scores.length).toFixed(2) : 0;
  //       };
  //       const latestLevel = feedbackList.length > 0
  //         ? feedbackList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].currentLevel
  //         : 'N/A';
  //       student.feedbackStats = {
  //         fluency: getAvg('fluency'),
  //         grammar: getAvg('grammar'),
  //         accent: getAvg('accent'),
  //         overallCFBR: getAvg('overallCfbr'),
  //         currentLevel: latestLevel
  //       };
  //     },
  //     error: err => {
  //       console.warn(`No feedback for student ${student.name}`, err);
  //     }
  //   });
  // }

  loadCourseProgress(student: Student): void {
    this.fetchCourseProgress(student._id);
  }

  assignCourseToStudent(student: Student): void {    
    const body = {
      studentId: student._id,
      courseName: student.courseAssigned,
      assistantId: student.vapiAccess.assistantId,
      apiKey: student.vapiAccess.apiKey
    };
    this.http.post('/api/admin/assign-course', body).subscribe({
      next: () => {
        alert(`Course and VAPI key assigned to ${student.name}`);
        this.fetchStudents();
      },
      error: err => {
        //console.error('Failed to assign course', err);
        alert('Failed to assign course');
      }
    });
  }

  updateVapiStatus(studentId: string, newStatus: VapiStatus): void {
    this.http.post('/api/admin/update-vapi-status', { studentId, newStatus }).subscribe({
      next: () => {
        this.fetchStudents();
      },
      error: err => {
        //console.error('Failed to update VAPI status', err);
      }
    });
  }

  onStatusChange(event: Event, studentId: string): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as VapiStatus;
    this.updateVapiStatus(studentId, newStatus);
  }

  trackById(index: number, student: Student): string {
    return student._id;
  }

  loadFeedbackForStudent(studentId: string): void {
    this.feedbackLoading = true;
    this.feedbackError = null;
    this.http.get<FeedbackEntry[]>(`/api/feedback/student/${studentId}`).subscribe({
      next: (data) => {
        this.feedbackMap[studentId] = data;
        this.selectedStudentId = studentId;
        this.feedbackLoading = false;
      },
      error: (err) => {
        //console.error('Failed to load feedback:', err);
        this.feedbackError = 'Failed to load feedback';
        this.feedbackLoading = false;
      }
    });
  }

  exportFeedbackAsCSV(studentId: string): void {
    const feedbackList = this.feedbackMap[studentId] || [];
    if (feedbackList.length === 0) {
      alert('No feedback to export.');
      return;
    }
    const headers = [
      'Student Name', 'Timestamp', 'Summary', 'Conversation Time',
      'Fluency', 'Accent', 'Grammar', 'Overall CFBR',
      'Common Mistakes', 'Level', 'Suggestions'
    ];
    const rows = feedbackList.map(fb => [
      fb.studentName || fb.studentId,
      fb.timestamp,
      fb.summary,
      fb.conversationTime,
      fb.fluency,
      fb.accent,
      fb.grammar,
      fb.overallCfbr,
      fb.commonMistakes,
      fb.currentLevel,
      fb.suggestedImprovement
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_${studentId}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  fetchCourseProgress(studentId: string): void {
    this.http.get<CourseProgress[]>(`/api/admin/course-progress/${studentId}`).subscribe({
      next: (progress) => {
        const student = this.students.find(s => s._id === studentId);
        if (student) {
          student.courseProgress = progress;
        }
      },
      error: err => {
        //console.error('Failed to fetch course progress', err);
      }
    });
  }

  resetMonthlyUsage(): void {
    if (!confirm('Are you sure you want to reset monthly usage for all students?')) return;
    this.http.post('/api/admin/reset-monthly-usage', {}).subscribe({
      next: (res: any) => {
        alert(res.message || 'Monthly usage reset.');
        this.fetchStudents();
      },
      error: err => {
        //console.error('Reset failed', err);
        alert('Failed to reset usage.');
      }
    });
  }

  openLinkDialog(student: any): void {
    const dialogRef = this.dialog.open(AssignElevenlabsDialogComponent, {
      data: { link: student.elevenLabsLink || '' }
    });
    dialogRef.afterClosed().subscribe(link => {
      if (link !== undefined) {
        this.http.put(`/api/admin/students/${student._id}/elevenlabs-link`, { elevenLabsLink: link })
          .subscribe({
            next: () => {
              student.elevenLabsLink = link;
            },
            error: err => {
              //console.error(err);
              alert('Failed to save link');
            }
          });
      }
    });
  }

  loadElevenLabsUsage(student: Student): void {

    this.elevenLabsService.getUsageByApiKey(student._id).subscribe({
      next: (res) => {

        if (res && res.usage && res.usage.subscription) {
          const subscription = res.usage.subscription;
          const characterCount = subscription.character_count || 0;
          const characterLimit = subscription.character_limit || 0;
          const remaining = characterLimit - characterCount;

          student.remainingMinutes = characterLimit
            ? Math.floor((remaining / characterLimit) * 60)
            : 0;

          student.planUpgradeDate = subscription.next_character_count_reset_unix
            ? new Date(subscription.next_character_count_reset_unix * 1000)
            .toISOString()
            .slice(0, 10)  // take only YYYY-MM-DD
          : undefined;

          student.remainingDays = student.planUpgradeDate
            ? Math.ceil((new Date(student.planUpgradeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : undefined;
        }
      },
      error: (err) => {
        //console.error(`❌ Failed to fetch ElevenLabs usage for ${student.name}:`, err);
        student.remainingMinutes = 0;
        student.planUpgradeDate = undefined;
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(id).subscribe({
        next: (response) => {
          alert('User deleted successfully!');
          //console.log('Deleted:', response);
          this.fetchStudents(); // Refresh your user list after deletion
        },
        error: (error) => {
          alert('Failed to delete user: ' + (error.error?.message || 'Please try again.'));
          //console.error('Delete failed:', error);
        }
      });
    }
  }


  saveElevenLabsLink(student: any): void {
    this.http.put(`/api/admin/students/${student._id}/elevenlabs-link`, {
      elevenLabsLink: student.elevenLabsLink
    }).subscribe({
      next: () => {
        alert('ElevenLabs link saved!');
        student.editingElevenLabs = false;
      },
      error: (err) => alert('Failed to save link: ' + err.message)
    });
  }

  cancelEditElevenLabs(student: any): void {
    student.editingElevenLabs = false;
  }
}
