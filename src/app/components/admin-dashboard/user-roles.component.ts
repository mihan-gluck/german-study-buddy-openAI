// src/app/components/admin-dashboard/user-roles.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-roles-page">
      <div class="page-header">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="page-title">
                <i class="fas fa-user-shield"></i>
                User Roles Management
              </h1>
              <p class="page-subtitle">Manage roles for teachers and administrators</p>
            </div>
            <div class="col-md-4 text-end">
              <div class="stats-quick">
                <div class="stat-item">
                  <span class="stat-number">{{ allTeachersAndAdmins.length }}</span>
                  <span class="stat-label">Total Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-content">
        <div class="container-fluid">
          
          <!-- Users Table -->
          <div class="data-table-card">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Teachers & Administrators</h5>
              </div>
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>Reg No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Change Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of allTeachersAndAdmins">
                      <td><span class="badge bg-secondary">{{ user.regNo }}</span></td>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" 
                              [ngClass]="{
                                'bg-primary': user.role === 'TEACHER',
                                'bg-warning': user.role === 'TEACHER_ADMIN',
                                'bg-danger': user.role === 'ADMIN'
                              }">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>
                        <select class="form-select form-select-sm" 
                                [(ngModel)]="user.newRole" 
                                (change)="onRoleChange(user)">
                          <option [value]="user.role" selected>Keep {{ user.role }}</option>
                          <option value="TEACHER" *ngIf="user.role !== 'TEACHER'">TEACHER</option>
                          <option value="TEACHER_ADMIN" *ngIf="user.role !== 'TEACHER_ADMIN'">TEACHER_ADMIN</option>
                          <option value="ADMIN" *ngIf="user.role !== 'ADMIN'">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-success" 
                                (click)="updateUserRole(user)"
                                [disabled]="!user.newRole || user.newRole === user.role">
                          <i class="fas fa-save"></i> Update
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-roles-page {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      opacity: 0.9;
      margin: 0;
    }

    .stats-quick {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 1rem;
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .data-table-card {
      margin-bottom: 2rem;
    }

    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 10px;
    }

    .card-header {
      background: white;
      border-bottom: 2px solid #f0f0f0;
      padding: 1.25rem;
    }

    .table {
      margin-bottom: 0;
    }

    .table thead th {
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.875rem;
    }

    .badge {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }

    .form-select-sm {
      min-width: 180px;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
    }
  `]
})
export class UserRolesComponent implements OnInit {
  allTeachersAndAdmins: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTeachersAndAdmins();
  }

  fetchTeachersAndAdmins(): void {
    this.http.get<any>(`${apiUrl}/auth/teachers-and-admins`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allTeachersAndAdmins = response.map((user: any) => ({
          ...user,
          newRole: user.role
        }));
      },
      error: (err) => {
        console.error('Failed to fetch teachers and admins:', err);
        alert('Failed to load users');
      }
    });
  }

  onRoleChange(user: any): void {
    console.log(`Role change requested for ${user.name}: ${user.role} -> ${user.newRole}`);
  }

  updateUserRole(user: any): void {
    if (!user.newRole || user.newRole === user.role) {
      return;
    }

    if (!confirm(`Are you sure you want to change ${user.name}'s role from ${user.role} to ${user.newRole}?`)) {
      user.newRole = user.role;
      return;
    }

    this.http.put(`${apiUrl}/auth/${user._id}`, { role: user.newRole }, { withCredentials: true }).subscribe({
      next: (response) => {
        alert(`Successfully updated ${user.name}'s role to ${user.newRole}`);
        user.role = user.newRole;
        this.fetchTeachersAndAdmins();
      },
      error: (err) => {
        console.error('Failed to update role:', err);
        alert('Failed to update role. Please try again.');
        user.newRole = user.role;
      }
    });
  }
}
