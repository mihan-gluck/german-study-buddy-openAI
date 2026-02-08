// src/app/components/teacher-assignments/teacher-assignments.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

interface AssignmentFile {
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface AssignmentSubmission {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  marks?: number;
  feedback?: string;
  files: AssignmentFile[];
  studentId?: {
    _id: string;
    name: string;
    regNo: string;
    email: string;
  };
}

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  templateUrl: './teacher-assignments.component.html',
  styleUrls: ['./teacher-assignments.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgIf,
    NgFor,
    DatePipe,
  ],
})
export class TeacherAssignmentsComponent {
  apiBase = '/api/assignments';
  submissions: AssignmentSubmission[] = [];
  loading = false;
  selected: AssignmentSubmission | null = null;

  editMarks: number | null = null;
  editFeedback = '';
  saving = false;
  error = '';
  message = '';

  constructor(private http: HttpClient) {
    this.loadSubmissions();
  }

  loadSubmissions(status?: string) {
    this.loading = true;
    this.error = '';

    const params: any = {};
    if (status) params.status = status;

    this.http
      .get<{ success: boolean; data: AssignmentSubmission[] }>(
        `${this.apiBase}/teacher`,
        {
          params,
          withCredentials: true,
        }
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.submissions = res.data || [];
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to load submissions.';
        },
      });
  }

  selectSubmission(s: AssignmentSubmission) {
    this.selected = s;
    this.editMarks = s.marks ?? null;
    this.editFeedback = s.feedback || '';
    this.message = '';
    this.error = '';
  }

  saveCorrection() {
    if (!this.selected) return;

    this.saving = true;
    this.error = '';
    this.message = '';

    const body: any = {
      marks: this.editMarks,
      feedback: this.editFeedback,
      status: 'CORRECTED',
    };

    this.http
      .put<{ success: boolean; data: AssignmentSubmission }>(
        `${this.apiBase}/${this.selected._id}/mark`,
        body,
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: (res) => {
          this.saving = false;
          this.message = 'Assignment marked successfully.';
          this.loadSubmissions();
          this.selected = res.data;
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.msg || 'Failed to save correction.';
        },
      });
  }

  getFileUrl(file: AssignmentFile): string {
    if (!file.path) return '#';
    if (file.path.startsWith('http')) return file.path;
    return '/' + file.path.replace(/^\/+/, '');
  }
}
