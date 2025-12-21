// src/app/components/admin-dashboard/module-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LearningModulesService } from '../../services/learning-modules.service';

interface ModuleWithStats {
  _id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
  totalUpdates: number;
  lastUpdateDate: Date;
  createdByTeacher: boolean;
  totalEnrollments: number;
}

@Component({
  selector: 'app-module-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Learning Module Management</h4>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="loadModules()">
                  <option value="all">All Modules</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <button class="btn btn-primary btn-sm" routerLink="/learning-modules">
                  <i class="fas fa-plus"></i> Create Module
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <!-- Summary Statistics -->
              <div class="row mb-4" *ngIf="summary">
                <div class="col-md-2">
                  <div class="stat-card bg-primary text-white">
                    <div class="stat-number">{{summary.totalModules}}</div>
                    <div class="stat-label">Total Modules</div>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="stat-card bg-success text-white">
                    <div class="stat-number">{{summary.activeModules}}</div>
                    <div class="stat-label">Active</div>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="stat-card bg-warning text-white">
                    <div class="stat-number">{{summary.inactiveModules}}</div>
                    <div class="stat-label">Inactive</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-info text-white">
                    <div class="stat-number">{{summary.teacherCreated}}</div>
                    <div class="stat-label">Created by Teachers</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-secondary text-white">
                    <div class="stat-number">{{summary.adminCreated}}</div>
                    <div class="stat-label">Created by Admins</div>
                  </div>
                </div>
              </div>

              <!-- Loading State -->
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <!-- Modules Table -->
              <div *ngIf="!loading" class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>Module</th>
                      <th>Level/Category</th>
                      <th>Created By</th>
                      <th>Last Updated</th>
                      <th>Version</th>
                      <th>Enrollments</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let module of modules">
                      <td>
                        <div>
                          <strong>{{module.title}}</strong>
                          <br>
                          <small class="text-muted">{{module.description | slice:0:80}}{{module.description.length > 80 ? '...' : ''}}</small>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-primary me-1">{{module.level}}</span>
                        <br>
                        <small class="text-muted">{{module.category}}</small>
                      </td>
                      <td>
                        <div>
                          <strong>{{module.createdBy.name}}</strong>
                          <br>
                          <small class="text-muted">
                            <span class="badge" [class]="module.createdByTeacher ? 'bg-info' : 'bg-secondary'">
                              {{module.createdBy.role}}
                            </span>
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small>{{formatDate(module.lastUpdateDate)}}</small>
                          <br>
                          <small class="text-muted" *ngIf="module.lastUpdatedBy">
                            by {{module.lastUpdatedBy.name}}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">v{{module.version}}</span>
                        <br>
                        <small class="text-muted">{{module.totalUpdates}} updates</small>
                      </td>
                      <td>
                        <span class="badge bg-success">{{module.totalEnrollments}}</span>
                      </td>
                      <td>
                        <span class="badge" [class]="module.isActive ? 'bg-success' : 'bg-danger'">
                          {{module.isActive ? 'Active' : 'Inactive'}}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-info" (click)="viewHistory(module._id)" title="View History">
                            <i class="fas fa-history"></i>
                          </button>
                          <button class="btn btn-outline-primary" [routerLink]="['/learning-modules', module._id]" title="View Module">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="btn btn-outline-warning" (click)="toggleStatus(module)" title="Toggle Status">
                            <i class="fas" [class]="module.isActive ? 'fa-pause' : 'fa-play'"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav *ngIf="pagination && pagination.pages > 1">
                <ul class="pagination justify-content-center">
                  <li class="page-item" [class.disabled]="pagination.current === 1">
                    <button class="page-link" (click)="changePage(pagination.current - 1)">Previous</button>
                  </li>
                  <li class="page-item" *ngFor="let page of getPageNumbers()" [class.active]="page === pagination.current">
                    <button class="page-link" (click)="changePage(page)">{{page}}</button>
                  </li>
                  <li class="page-item" [class.disabled]="pagination.current === pagination.pages">
                    <button class="page-link" (click)="changePage(pagination.current + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div class="modal fade" id="historyModal" tabindex="-1" *ngIf="selectedModuleHistory">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Module Update History</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <h6>{{selectedModuleHistory.title}}</h6>
            <p><strong>Created by:</strong> {{selectedModuleHistory.createdBy.name}} ({{selectedModuleHistory.createdBy.role}}) on {{formatDate(selectedModuleHistory.createdAt)}}</p>
            <p><strong>Current Version:</strong> {{selectedModuleHistory.currentVersion}}</p>
            
            <h6 class="mt-4">Update History:</h6>
            <div class="timeline">
              <div class="timeline-item" *ngFor="let update of selectedModuleHistory.updateHistory; let i = index">
                <div class="timeline-marker bg-primary"></div>
                <div class="timeline-content">
                  <div class="d-flex justify-content-between">
                    <strong>Version {{update.version}}</strong>
                    <small class="text-muted">{{formatDate(update.updatedAt)}}</small>
                  </div>
                  <p class="mb-1">{{update.changes}}</p>
                  <small class="text-muted">Updated by {{update.updatedBy.name}} ({{update.updatedBy.role}})</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1rem;
      border-radius: 0.5rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
    }
    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    .timeline {
      position: relative;
      padding-left: 2rem;
    }
    .timeline-item {
      position: relative;
      margin-bottom: 1.5rem;
    }
    .timeline-marker {
      position: absolute;
      left: -2rem;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      top: 0.25rem;
    }
    .timeline-content {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 3px solid #007bff;
    }
  `]
})
export class ModuleManagementComponent implements OnInit {
  modules: ModuleWithStats[] = [];
  summary: any = null;
  pagination: any = null;
  loading = true;
  statusFilter = 'all';
  selectedModuleHistory: any = null;

  constructor(private learningModulesService: LearningModulesService) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.loading = true;
    this.learningModulesService.getModulesForAdmin({
      status: this.statusFilter,
      page: 1,
      limit: 20
    }).subscribe({
      next: (response) => {
        this.modules = response.modules;
        this.summary = response.summary;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.loading = false;
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination.pages) {
      this.loading = true;
      this.learningModulesService.getModulesForAdmin({
        status: this.statusFilter,
        page: page,
        limit: 20
      }).subscribe({
        next: (response) => {
          this.modules = response.modules;
          this.pagination = response.pagination;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading modules:', error);
          this.loading = false;
        }
      });
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(1, this.pagination.current - 2);
    const end = Math.min(this.pagination.pages, this.pagination.current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewHistory(moduleId: string): void {
    this.learningModulesService.getModuleHistory(moduleId).subscribe({
      next: (history) => {
        this.selectedModuleHistory = history;
        // Open modal (you might want to use a proper modal service)
        const modal = document.getElementById('historyModal');
        if (modal) {
          // Bootstrap modal show
          (window as any).bootstrap?.Modal?.getOrCreateInstance(modal)?.show();
        }
      },
      error: (error) => {
        console.error('Error loading module history:', error);
        alert('Failed to load module history');
      }
    });
  }

  toggleStatus(module: ModuleWithStats): void {
    const newStatus = !module.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} this module?`)) {
      const updateData: any = { 
        isActive: newStatus,
        changeDescription: `Module ${action}d by admin`
      };
      
      this.learningModulesService.updateModule(module._id, updateData).subscribe({
        next: () => {
          module.isActive = newStatus;
          alert(`Module ${action}d successfully`);
        },
        error: (error) => {
          console.error(`Error ${action}ing module:`, error);
          alert(`Failed to ${action} module`);
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}