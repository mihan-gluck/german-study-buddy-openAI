//src/app/components/admin-dashboard/admin-dashboard.component.ts

import { Component, OnInit, TrackByFunction } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type VapiStatus = 'active' | 'paused' | 'finished';

interface Student {
  _id: string;
  name: string;
  email: string;
  courseAssigned: string;
  registeredAt: string;
  vapiAccess: {
    status: VapiStatus;
    totalMonthlyUsage: number;
    apiKey?: string;
    assistantID?: string;
  };
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
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
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching students:', err);
        this.error = 'Failed to load students';
        this.loading = false;
      }
    });
  }

  assignCourseToStudent(student: Student): void {
    const body = {
      studentId: student._id,
      courseName: student.courseAssigned,
      assistantId: student.vapiAccess.assistantID,
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
}