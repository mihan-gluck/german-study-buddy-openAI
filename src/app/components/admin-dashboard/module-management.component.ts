// src/app/components/admin-dashboard/module-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LearningModulesService } from '../../services/learning-modules.service';
import { ModuleTrashService } from '../../services/module-trash.service';

interface ModuleWithStats {
  _id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  visibleToStudents?: boolean;  // ✅ NEW
  publishedAt?: Date;           // ✅ NEW
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
    <div class="admin-modules">
      <!-- Header Section -->
      <div class="admin-header">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="admin-title">
                <i class="fas fa-book"></i>
                Module Management
              </h1>
              <p class="admin-subtitle">Manage and organize all learning modules</p>
            </div>
            <div class="col-md-4 text-end">
              <div class="admin-stats-quick" *ngIf="summary">
                <div class="stat-item">
                  <span class="stat-number">{{ summary.totalModules || 0 }}</span>
                  <span class="stat-label">Total Modules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="admin-content">
        <div class="container-fluid">
          
          <!-- Action Bar -->
          <div class="action-bar">
            <div class="row align-items-center">
              <div class="col-md-6">
                <button class="btn btn-primary btn-add-module" routerLink="/learning-modules">
                  <i class="fas fa-plus"></i>
                  Create New Module
                </button>
                <button class="btn btn-trash-module" routerLink="/admin-trash">
                  <i class="fas fa-trash"></i>
                  Trash
                </button>
              </div>
              <div class="col-md-6 text-end">
                <div class="filter-options">
                  <select class="form-select" [(ngModel)]="statusFilter" (change)="loadModules()">
                    <option value="all">All Modules</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Statistics -->
          <div class="stats-section" *ngIf="summary">
            <div class="row">
              <div class="col-md-2">
                <div class="stat-card bg-primary text-white">
                  <div class="stat-icon"><i class="fas fa-book"></i></div>
                  <div class="stat-content">
                    <h3>{{ summary.totalModules }}</h3>
                    <p>Total Modules</p>
                  </div>
                </div>
              </div>
              <div class="col-md-2">
                <div class="stat-card bg-success text-white">
                  <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                  <div class="stat-content">
                    <h3>{{ summary.activeModules }}</h3>
                    <p>Active</p>
                  </div>
                </div>
              </div>
              <div class="col-md-2">
                <div class="stat-card bg-warning text-white">
                  <div class="stat-icon"><i class="fas fa-pause-circle"></i></div>
                  <div class="stat-content">
                    <h3>{{ summary.inactiveModules }}</h3>
                    <p>Inactive</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                  <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                  <div class="stat-content">
                    <h3>{{ summary.teacherCreated }}</h3>
                    <p>Created by Teachers</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-secondary text-white">
                  <div class="stat-icon"><i class="fas fa-user-shield"></i></div>
                  <div class="stat-content">
                    <h3>{{ summary.adminCreated }}</h3>
                    <p>Created by Admins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="loading-state text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading modules...</p>
          </div>

          <!-- Results Summary -->
          <div *ngIf="!loading" class="results-summary">
            <div class="d-flex justify-content-between align-items-center">
              <div class="results-info">
                <span class="results-count">{{ modules?.length || 0 }}</span>
                <span class="results-text">modules found</span>
              </div>
            </div>
          </div>

          <!-- Modules Table -->
          <div *ngIf="!loading" class="modules-table">
            <div class="data-table-card">
              <div class="card">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>Module</th>
                        <th>Level/Category</th>
                        <th>Created By</th>
                        <th>Last Updated</th>
                        <th>Version</th>
                        <th>Enrollments</th>
                        <th>Status</th>
                        <th class="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let module of modules">
                        <td>
                          <div class="module-info">
                            <div class="module-title">{{ module.title }}</div>
                            <div class="module-desc">{{ module.description | slice:0:80 }}{{ module.description.length > 80 ? '...' : '' }}</div>
                          </div>
                        </td>
                        <td>
                          <div class="level-category">
                            <span class="badge bg-primary me-1">{{ module.level }}</span>
                            <br>
                            <small class="text-muted">{{ module.category }}</small>
                          </div>
                        </td>
                        <td>
                          <div class="creator-info">
                            <div class="creator-name">{{ module.createdBy.name }}</div>
                            <span class="badge" [class]="module.createdByTeacher ? 'bg-info' : 'bg-secondary'">
                              {{ module.createdBy.role }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div class="update-info">
                            <div class="update-date">{{ formatDate(module.lastUpdateDate) }}</div>
                            <small class="text-muted" *ngIf="module.lastUpdatedBy">
                              by {{ module.lastUpdatedBy.name }}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div class="version-info">
                            <span class="badge bg-info">v{{ module.version }}</span>
                            <br>
                            <small class="text-muted">{{ module.totalUpdates }} updates</small>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-success">{{ module.totalEnrollments }}</span>
                        </td>
                        <td>
                          <span class="badge" [class]="module.isActive ? 'bg-success' : 'bg-danger'">
                            {{ module.isActive ? 'Active' : 'Inactive' }}
                          </span>
                          <br>
                          <span class="badge mt-1" [class]="module.visibleToStudents ? 'bg-primary' : 'bg-warning'">
                            {{ module.visibleToStudents ? '👁️ Visible' : '🔒 Hidden' }}
                          </span>
                        </td>
                        <td class="text-center">
                          <div class="action-buttons">
                            <button class="btn btn-sm me-1" 
                                    [class]="module.visibleToStudents ? 'btn-outline-warning' : 'btn-outline-success'"
                                    (click)="toggleVisibility(module)" 
                                    [title]="module.visibleToStudents ? 'Hide from students' : 'Show to students'">
                              <i class="fas" [class]="module.visibleToStudents ? 'fa-eye-slash' : 'fa-eye'"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success me-1" (click)="testModule(module)" title="Test Module">
                              <i class="fas fa-play-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info me-1" (click)="viewHistory(module._id)" title="View History">
                              <i class="fas fa-history"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/edit-module', module._id]" title="Edit Module">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning me-1" (click)="toggleStatus(module)" title="Toggle Status">
                              <i class="fas" [class]="module.isActive ? 'fa-pause' : 'fa-play'"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" (click)="deleteModule(module)" title="Delete Module">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <nav *ngIf="pagination && pagination.pages > 1" class="pagination-nav">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="pagination.current === 1">
                <button class="page-link" (click)="changePage(pagination.current - 1)">Previous</button>
              </li>
              <li class="page-item" *ngFor="let page of getPageNumbers()" [class.active]="page === pagination.current">
                <button class="page-link" (click)="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" [class.disabled]="pagination.current === pagination.pages">
                <button class="page-link" (click)="changePage(pagination.current + 1)">Next</button>
              </li>
            </ul>
          </nav>

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
            <h6>{{ selectedModuleHistory.title }}</h6>
            <p><strong>Created by:</strong> {{ selectedModuleHistory.createdBy.name }} ({{ selectedModuleHistory.createdBy.role }}) on {{ formatDate(selectedModuleHistory.createdAt) }}</p>
            <p><strong>Current Version:</strong> {{ selectedModuleHistory.currentVersion }}</p>
            
            <h6 class="mt-4">Update History:</h6>
            <div class="timeline">
              <div class="timeline-item" *ngFor="let update of selectedModuleHistory.updateHistory; let i = index">
                <div class="timeline-marker bg-primary"></div>
                <div class="timeline-content">
                  <div class="d-flex justify-content-between">
                    <strong>Version {{ update.version }}</strong>
                    <small class="text-muted">{{ formatDate(update.updatedAt) }}</small>
                  </div>
                  <p class="mb-1">{{ update.changes }}</p>
                  <small class="text-muted">Updated by {{ update.updatedBy.name }} ({{ update.updatedBy.role }})</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Module Management Dashboard Styles */
    .admin-modules {
      background-color: #f8f9fa;
      min-height: calc(100vh - 80px);
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* ====== Header Section ====== */
    .admin-header {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    .admin-title {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .admin-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 0;
    }

    .admin-stats-quick {
      display: flex;
      justify-content: flex-end;
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      opacity: 0.8;
      margin-top: 0.25rem;
    }

    /* ====== Main Content Area ====== */
    .admin-content {
      padding: 0 1rem;
    }

    /* ====== Action Bar ====== */
    .action-bar {
      margin-bottom: 2rem;
    }

    .btn-add-module {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      border: none;
      color: white;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
      transition: all 0.2s ease;
    }

    .btn-add-module:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.4);
      color: white;
    }

    .btn-trash-module {
      background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
      border: none;
      color: white;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      margin-left: 0.75rem;
      box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
      transition: all 0.2s ease;
    }

    .btn-trash-module:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
      color: white;
    }

    .filter-options .form-select {
      border-color: #007bff;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-weight: 500;
    }

    .filter-options .form-select:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    /* ====== Statistics Cards ====== */
    .stats-section {
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-right: 1.5rem;
      opacity: 0.8;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }

    .stat-content p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    /* ====== Loading State ====== */
    .loading-state {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .loading-state .spinner-border {
      color: #007bff;
    }

    /* ====== Results Summary ====== */
    .results-summary {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .results-count {
      font-size: 1.25rem;
      font-weight: 700;
      color: #007bff;
    }

    .results-text {
      color: #6c757d;
      margin-left: 0.5rem;
    }

    /* ====== Modules Table ====== */
    .modules-table .data-table-card .card {
      border: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .modules-table .table {
      margin-bottom: 0;
      font-size: 0.9rem;
    }

    .modules-table .table thead th {
      background: linear-gradient(135deg, #343a40 0%, #495057 100%);
      color: white;
      font-weight: 600;
      border: none;
      padding: 1rem 0.75rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .modules-table .table tbody td {
      padding: 1rem 0.75rem;
      vertical-align: middle;
      border-bottom: 1px solid #f0f0f0;
    }

    .modules-table .table tbody tr:hover {
      background-color: rgba(0, 123, 255, 0.05);
    }

    /* ====== Module Info Styling ====== */
    .module-info .module-title {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .module-info .module-desc {
      color: #6c757d;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .level-category .badge {
      font-size: 0.75rem;
      padding: 0.4em 0.6em;
      font-weight: 500;
    }

    .creator-info .creator-name {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .update-info .update-date {
      font-size: 0.85rem;
      color: #495057;
    }

    .version-info .badge {
      font-size: 0.75rem;
      padding: 0.4em 0.6em;
      font-weight: 500;
    }

    /* ====== Action Buttons ====== */
    .action-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .action-buttons .btn:hover {
      transform: translateY(-1px);
    }

    /* ====== Pagination ====== */
    .pagination-nav {
      margin-top: 2rem;
    }

    .pagination .page-link {
      color: #007bff;
      border-color: #dee2e6;
    }

    .pagination .page-item.active .page-link {
      background-color: #007bff;
      border-color: #007bff;
    }

    .pagination .page-link:hover {
      color: #0056b3;
      background-color: #e9ecef;
      border-color: #dee2e6;
    }

    /* ====== Timeline Styles ====== */
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

    /* ====== Responsive Design ====== */
    @media (max-width: 768px) {
      .admin-content {
        padding: 0 0.5rem;
      }
      
      .admin-title {
        font-size: 1.75rem;
      }
      
      .admin-subtitle {
        font-size: 1rem;
      }
      
      .stat-item {
        padding: 0.75rem 1rem;
      }
      
      .stat-number {
        font-size: 1.5rem;
      }
      
      .action-bar .row > div {
        margin-bottom: 1rem;
        text-align: center;
      }
      
      .results-summary {
        text-align: center;
      }
      
      .stat-card {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
      }
      
      .stat-icon {
        margin-right: 0;
        margin-bottom: 0.5rem;
        font-size: 2rem;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .action-buttons .btn {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }
      
      .modules-table .table-responsive {
        font-size: 0.8rem;
      }
    }

    @media (max-width: 576px) {
      .admin-header {
        padding: 1.5rem 0;
      }
      
      .admin-title {
        font-size: 1.5rem;
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }
      
      .admin-stats-quick {
        justify-content: center;
        margin-top: 1rem;
      }
      
      .stats-section .row > div {
        margin-bottom: 1rem;
      }
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

  constructor(
    private learningModulesService: LearningModulesService,
    private moduleTrashService: ModuleTrashService,
    private router: Router
  ) {}

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

  // ✅ NEW: Toggle module visibility for students
  toggleVisibility(module: ModuleWithStats): void {
    const newVisibility = !module.visibleToStudents;
    const action = newVisibility ? 'show to' : 'hide from';
    
    if (confirm(`Are you sure you want to ${action} students?\n\nModule: ${module.title}`)) {
      this.learningModulesService.toggleModuleVisibility(module._id, newVisibility).subscribe({
        next: (response) => {
          module.visibleToStudents = newVisibility;
          if (newVisibility && response.module.publishedAt) {
            module.publishedAt = response.module.publishedAt;
          }
          alert(`Module ${newVisibility ? 'published to' : 'hidden from'} students successfully`);
        },
        error: (error) => {
          console.error(`Error toggling module visibility:`, error);
          alert(`Failed to update module visibility`);
        }
      });
    }
  }

  // Test module directly via AI tutor chat
  testModule(module: ModuleWithStats): void {
    const confirmTest = confirm(
      `🧪 Test Module: "${module.title}"\n\n` +
      `This will start the AI tutoring session for this module, allowing you to experience it as a student would.\n\n` +
      `Continue with testing?`
    );

    if (confirmTest) {
      this.router.navigate(['/ai-tutor-chat'], {
        queryParams: {
          moduleId: module._id,
          sessionType: 'teacher-test',
          testMode: 'true'
        }
      });
    }
  }

  deleteModule(module: ModuleWithStats): void {
    const confirmMessage = `⚠️ DELETE MODULE WARNING ⚠️

This will move "${module.title}" to the trash.
The module will be automatically deleted after 30 days.

You can restore it from the Trash Management page if needed.

Are you sure you want to delete this module?`;

    if (confirm(confirmMessage)) {
      this.moduleTrashService.moveToTrash(module._id, 'Admin deleted module from management page').subscribe({
        next: (response) => {
          console.log('✅ Module moved to trash:', response);
          alert('Module moved to trash successfully');
          this.loadModules(); // Reload the modules list
        },
        error: (error) => {
          console.error('❌ Error moving module to trash:', error);
          alert('Failed to delete module');
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