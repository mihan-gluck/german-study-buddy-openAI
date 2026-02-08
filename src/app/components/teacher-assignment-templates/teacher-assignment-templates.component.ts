// src/app/components/teacher-assignment-templates/teacher-assignment-templates.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  isActive: boolean;
  createdAt: string;
  teacherId?: { name: string; regNo: string };
  files: TemplateFile[];
}

@Component({
  selector: 'app-teacher-assignment-templates',
  standalone: true,
  templateUrl: './teacher-assignment-templates.component.html',
  styleUrls: ['./teacher-assignment-templates.component.css'],
  imports: [DatePipe, CommonModule, FormsModule],
})
export class TeacherAssignmentTemplatesComponent {
  apiBase = '/api/assignment-templates';

  // form
  title = '';
  description = '';
  courseId = '';
  moduleId = '';
  dueDate = '';
  selectedFiles: File[] = [];

  loadingCreate = false;
  createError = '';
  createMessage = '';

  templates: AssignmentTemplate[] = [];
  loadingList = false;
  listError = '';

  constructor(private http: HttpClient) {
    this.loadTemplates();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedFiles = Array.from(input.files);
  }

  createTemplate() {
    if (!this.title) {
      this.createError = 'Title is required.';
      this.createMessage = '';
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.createError = 'Please attach at least one file.';
      this.createMessage = '';
      return;
    }

    this.loadingCreate = true;
    this.createError = '';
    this.createMessage = '';

    const formData = new FormData();
    formData.append('title', this.title);
    if (this.description) formData.append('description', this.description);
    if (this.courseId) formData.append('courseId', this.courseId);
    if (this.moduleId) formData.append('moduleId', this.moduleId);
    if (this.dueDate) formData.append('dueDate', this.dueDate);

    this.selectedFiles.forEach((f) => formData.append('files', f));

    this.http
      .post<{ ok: boolean; data: AssignmentTemplate }>(this.apiBase, formData, {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.loadingCreate = false;
          this.createMessage = 'Assignment template created.';
          this.title = '';
          this.description = '';
          this.courseId = '';
          this.moduleId = '';
          this.dueDate = '';
          this.selectedFiles = [];
          this.loadTemplates();
        },
        error: (err) => {
          this.loadingCreate = false;
          this.createError = err.error?.msg || 'Failed to create template.';
        },
      });
  }

  loadTemplates() {
    this.loadingList = true;
    this.listError = '';

    this.http
      .get<{ ok: boolean; data: AssignmentTemplate[] }>(this.apiBase, {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.loadingList = false;
          this.templates = res.data || [];
        },
        error: () => {
          this.loadingList = false;
          this.listError = 'Failed to load templates.';
        },
      });
  }

  getFileUrl(file: TemplateFile): string {
    if (!file.path) return '#';
    if (file.path.startsWith('http')) return file.path;
    return '/' + file.path.replace(/^\/+/, '');
  }
}
