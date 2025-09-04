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
  name: string;
  email: string;
  courseAssigned: string;
  registeredAt: string;
  elevenLabsApiKey?: string;
  subscription: string;

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
  students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedStudentIds = new Set<string>();

  loading = false;
  error = '';
  filters = { course: '', level: '', status: '' };
  levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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
    private elevenLabsService: ElevenLabsUsageService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.role !== 'ADMIN') {
        this.router.navigate(['/dashboard']);
        return;
      }
    } catch (error) {
      console.error('Invalid token:', error);
      this.router.navigate(['/auth/login']);
      return;
    }
    this.fetchStudents();
    
  }

fetchStudents(): void {
  this.loading = true;
  const token = this.authService.getToken();
  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  this.http.get<{ success: boolean; data: Student[] }>('/api/admin/students', { headers }).subscribe({
    next: res => {
      if (res.success) {
        this.students = res.data;
        this.students.forEach(student => {
          this.loadFeedbackStats(student);
          this.loadCourseProgress(student);
          this.loadElevenLabsUsage(student); // <-- pass single student
          console.log('Student data:', student);
        });
        this.filteredStudents = [...this.students];
      } else {
        this.error = 'Failed to load students';
      }
      this.loading = false;
    },
    error: err => {
      console.error('Error fetching students:', err);
      this.error = err.error?.msg || 'Failed to load students';
      this.loading = false;
    }
  });
  }


  // fetchStudents(): void {
  // this.loading = true;
  // this.http.get<{ success: boolean; data: Student[] }>('/api/admin/students').subscribe({
  //   next: res => {
  //     this.students = res.data;   // ✅ use res.data instead of res
  //     this.students.forEach(student => {
  //       this.loadFeedbackStats(student);
  //       this.loadCourseProgress(student);
  //     });
  //     this.filteredStudents = [...this.students];
  //     this.loading = false;
  //   },
  //   error: err => {
  //     console.error('Error fetching students:', err);
  //     this.error = 'Failed to load students';
  //     this.loading = false;
  //   }
  // });
  // }


  applyFilters(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesCourse = this.filters.course === '' || (student.courseAssigned?.toLowerCase().includes(this.filters.course.toLowerCase()));
      const matchesStatus = this.filters.status === '' || student.vapiAccess?.status === this.filters.status;
      const feedback = student.feedbackStats;
      const matchesLevel = this.filters.level === '' || (feedback && feedback.currentLevel === this.filters.level);
      return matchesCourse && matchesStatus && matchesLevel;
    });
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
        console.error('Bulk assignment failed', err);
        alert('Bulk assignment failed');
      }
    });
  }

  loadFeedbackStats(student: Student): void {
    this.feedbackService.getStudentFeedback(student._id).subscribe({
      next: (feedbackList: FeedbackEntry[]) => {
        const getAvg = (key: 'fluency' | 'grammar' | 'accent' | 'overallCfbr'): number => {
          const scores = feedbackList
            .map(f => parseFloat(f[key] as string))
            .filter(n => !isNaN(n));
          return scores.length ? +(scores.reduce((a, b) => a + b) / scores.length).toFixed(2) : 0;
        };
        const latestLevel = feedbackList.length > 0
          ? feedbackList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].currentLevel
          : 'N/A';
        student.feedbackStats = {
          fluency: getAvg('fluency'),
          grammar: getAvg('grammar'),
          accent: getAvg('accent'),
          overallCFBR: getAvg('overallCfbr'),
          currentLevel: latestLevel
        };
      },
      error: err => {
        console.warn(`No feedback for student ${student.name}`, err);
      }
    });
  }

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
        console.error('Failed to assign course', err);
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
        console.error('Failed to update VAPI status', err);
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
        console.error('Failed to load feedback:', err);
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
        console.error('Failed to fetch course progress', err);
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
        console.error('Reset failed', err);
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
              console.error(err);
              alert('Failed to save link');
            }
          });
      }
    });
  }

  loadElevenLabsUsage(student: Student): void {
    if (!student.elevenLabsApiKey) {
      student.remainingMinutes = 0;
      student.planUpgradeDate = undefined;
      return;
    }

    this.elevenLabsService.getUsageByApiKey(student.elevenLabsApiKey).subscribe({
      next: (res) => {
        console.log(`🔹 API response for ${student.name}:`, res);

        if (res && res.usage && res.usage.subscription) {
          const subscription = res.usage.subscription;
          const characterCount = subscription.character_count || 0;
          const characterLimit = subscription.character_limit || 0;
          const remaining = characterLimit - characterCount;

          student.remainingMinutes = characterLimit
            ? Math.floor((remaining / characterLimit) * 15)
            : 0;

          student.planUpgradeDate = subscription.next_character_count_reset_unix
            ? new Date(subscription.next_character_count_reset_unix * 1000)
            .toISOString()
            .slice(0, 10)  // take only YYYY-MM-DD
          : undefined;

          console.log(`✅ Processed usage for ${student.name}:`, {
            remainingMinutes: student.remainingMinutes,
            planUpgradeDate: student.planUpgradeDate
          });
        }
      },
      error: (err) => {
        console.error(`❌ Failed to fetch ElevenLabs usage for ${student.name}:`, err);
        student.remainingMinutes = 0;
        student.planUpgradeDate = undefined;
      }
    });
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
