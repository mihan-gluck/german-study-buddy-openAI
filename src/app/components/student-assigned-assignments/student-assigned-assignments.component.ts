// src/app/components/student-assigned-assignments/student-assigned-assignments.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface TemplateFile {
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface AssignmentTemplate {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  createdAt: string;
  teacherId?: { name: string; regNo: string };
  files: TemplateFile[];
}

interface AssignedMock {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  teacherName?: string;
  fileUrl?: string;
  status?: string;
}

@Component({
  selector: 'app-student-assigned-assignments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-assigned-assignments.component.html',
  styleUrls: ['./student-assigned-assignments.component.css'],
})
export class StudentAssignedAssignmentsComponent implements OnChanges {
  @Input() courseId: string | null = null;
  @Input() moduleId: string | null = null;

  apiBase = '/api/assignment-templates';

  templates: AssignmentTemplate[] = [];
  loading = false;
  error = '';

  assignedAssignments: AssignedMock[] = [];

  constructor(private http: HttpClient) {
    this.loadAssigned();
    this.loadTemplates();
  }

  ngOnChanges(): void {
    this.loadTemplates();
  }


  loadTemplates() {
    this.loading = true;
    this.error = '';

    const params: any = { activeOnly: 'true' };
    if (this.courseId) params.courseId = this.courseId;
    if (this.moduleId) params.moduleId = this.moduleId;

    this.http
      .get<{ ok: boolean; data: AssignmentTemplate[] }>(this.apiBase, {
        params,
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.templates = res.data || [];
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to load assigned exams/assignments.';
        },
      });
  }

  loadAssigned() {
    this.http
      .get<{ data: AssignedMock[] }>('/api/assignments/student-assigned', {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.assignedAssignments = res.data || [];
        },
        error: (err) => {
          console.error('Failed to load assigned exams', err);
        },
      });
  }

  downloadAssignment(assignment: AssignedMock): void {
    if (assignment.fileUrl) {
      window.open(assignment.fileUrl, '_blank');
    }
  }

  getFileUrl(file: TemplateFile): string {
    if (!file.path) return '#';
    if (file.path.startsWith('http')) return file.path;
    return '/' + file.path.replace(/^\/+/, '');
  }
}
