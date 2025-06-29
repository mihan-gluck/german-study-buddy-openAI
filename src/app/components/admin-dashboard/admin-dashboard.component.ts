//src/app/components/admin-dashboard/admin-dashboard.component.ts

import { Component, OnInit, TrackByFunction } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
//import { FeedbackEntry } from '../../feedback-entry.model';

type VapiStatus = 'active' | 'paused' | 'finished';

interface CourseProgress {
  courseId: string;
  courseName: string;
  progressPercentage: number;
  lastUpdated: string;
}

interface Student {
  student: { fluency: number; grammar: number; accent: number; overallCFBR: number; currentLevel: string;};
  _id: string;
  name: string;
  email: string;
  courseAssigned: string;
  registeredAt: string;
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
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit {
  students: Student[] = [];
  loading = true;
  error: string | null = null;

  feedbackMap: { [studentId: string]: FeedbackEntry[] } = {};
  selectedStudentId: string = '';
  feedbackLoading: boolean = false;
  feedbackError: string | null = null;
  student: any;
  selectedStudentName: any;

  assistantId?: string;

  filters = {
  course: '',
  level: '',
  status: ''
  };

  levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];  // adjust as needed
  filteredStudents: Student[] = [];
    loadCourseProgress: any;

  selectedStudentIds: Set<string> = new Set();

  bulkCourseName: string = '';
  bulkAssistantId: string = '';
  bulkApiKey: string = '';



  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private feedbackService: FeedbackService,
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.role !== 'admin') {
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
    this.http.get<Student[]>('/api/admin/students').subscribe({
      next: data => {
        this.students = data;

        // For each student, fetch feedback stats and course progress in parallel
        this.students.forEach(student => {
          this.loadFeedbackStats(student);
          this.loadCourseProgress(student);
        });

        this.filteredStudents = [...this.students];
      },
      error: err => {
        console.error('Error fetching students:', err);
        this.error = 'Failed to load students';
        this.loading = false;
      }
    });
  }

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
        this.fetchStudents(); // refresh
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


  assignCourseToStudent(student: Student): void {
    const body = {
      studentId: student._id,
      courseName: student.courseAssigned,
      // check below code with .assistantId
      //assistantId: student.vapiAccess.assistantID,
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

  feedbackList: FeedbackEntry[] = [];
    
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
          this.fetchStudents(); // refresh data
        },
        error: err => {
          console.error('Reset failed', err);
          alert('Failed to reset usage.');
        }
      });
    }


}