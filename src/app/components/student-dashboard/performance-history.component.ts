// src/app/components/student-dashboard/performance-history.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

interface SessionHistory {
  id: string;
  sessionId: string;
  module: {
    id: string;
    title: string;
    level: string;
    category: string;
  };
  sessionType: string;
  sessionState: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  formattedDuration: string;
  summary: {
    conversationCount: number;
    timeSpentMinutes: number;
    vocabularyUsed: string[];
    exerciseScore: number;
    conversationScore: number;
    totalScore: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  };
  performanceSummary: {
    conversationCount: number;
    timeSpent: number;
    vocabularyUsed: string[];
    exerciseAccuracy: number;
    totalScore: number;
    sessionCompleted: boolean;
    moduleCompleted: boolean;
  };
  isModuleCompleted: boolean;
  createdAt: Date;
  attemptNumber?: number;
}

interface PerformanceStats {
  totalSessions: number;
  completedSessions: number;
  modulesCompleted: number;
  totalTimeSpent: number;
  averageScore: number;
  totalVocabularyLearned: number;
  completionRate: number;
  averageSessionDuration: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

@Component({
  selector: 'app-performance-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">📊 My Performance History</h4>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm" [(ngModel)]="selectedModule" (change)="loadHistory()">
                  <option value="">All Modules</option>
                  <option *ngFor="let module of availableModules" [value]="module.id">
                    {{module.title}} ({{module.level}})
                  </option>
                </select>
                <button class="btn btn-primary btn-sm" (click)="loadHistory()">
                  <i class="fas fa-refresh"></i> Refresh
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <!-- Performance Statistics -->
              <div class="row mb-4" *ngIf="stats">
                <div class="col-12">
                  <h5 class="mb-3">📈 Your Learning Statistics</h5>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-primary text-white rounded">
                    <h4 class="mb-1">{{stats.totalSessions}}</h4>
                    <small>Total Sessions</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-success text-white rounded">
                    <h4 class="mb-1">{{stats.modulesCompleted}}</h4>
                    <small>Modules Completed</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-info text-white rounded">
                    <h4 class="mb-1">{{formatTimeSpent(stats.totalTimeSpent)}}</h4>
                    <small>Total Study Time</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-warning text-white rounded">
                    <h4 class="mb-1">{{stats.averageScore}}</h4>
                    <small>Average Score</small>
                  </div>
                </div>
              </div>

              <!-- Additional Stats Row -->
              <div class="row mb-4" *ngIf="stats">
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-secondary text-white rounded">
                    <h4 class="mb-1">{{stats.completionRate}}%</h4>
                    <small>Success Rate</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-dark text-white rounded">
                    <h4 class="mb-1">{{stats.totalVocabularyLearned}}</h4>
                    <small>Words Learned</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 bg-purple text-white rounded">
                    <h4 class="mb-1">{{stats.averageSessionDuration}}m</h4>
                    <small>Avg Session</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card text-center p-3 rounded"
                       [class.bg-success]="stats.improvementTrend === 'improving'"
                       [class.bg-warning]="stats.improvementTrend === 'stable'"
                       [class.bg-danger]="stats.improvementTrend === 'declining'"
                       [class.text-white]="true">
                    <h4 class="mb-1">
                      <i class="fas fa-arrow-up" *ngIf="stats.improvementTrend === 'improving'"></i>
                      <i class="fas fa-minus" *ngIf="stats.improvementTrend === 'stable'"></i>
                      <i class="fas fa-arrow-down" *ngIf="stats.improvementTrend === 'declining'"></i>
                    </h4>
                    <small>{{getTrendLabel(stats.improvementTrend)}}</small>
                  </div>
                </div>
              </div>

              <!-- Session History -->
              <div class="mb-4">
                <h5 class="mb-3">📚 Session History</h5>
                
                <!-- Group sessions by module -->
                <div *ngFor="let moduleGroup of groupedSessions" class="module-group mb-4">
                  <div class="module-header p-3 bg-light rounded-top">
                    <h6 class="mb-1">
                      <strong>{{moduleGroup.moduleTitle}}</strong>
                      <span class="badge bg-secondary ms-2">{{moduleGroup.moduleLevel}}</span>
                      <span class="badge bg-info ms-1">{{moduleGroup.sessions.length}} attempts</span>
                    </h6>
                    <small class="text-muted">{{moduleGroup.moduleCategory}}</small>
                  </div>
                  
                  <div class="sessions-timeline">
                    <div *ngFor="let session of moduleGroup.sessions; let i = index" 
                         class="session-card p-3 border-start border-3"
                         [class.border-success]="session.sessionState === 'completed'"
                         [class.border-warning]="session.sessionState === 'manually_ended'"
                         [class.border-danger]="session.sessionState === 'abandoned'"
                         [class.bg-light]="i % 2 === 0">
                      
                      <div class="row align-items-center">
                        <div class="col-md-2">
                          <div class="text-center">
                            <div class="attempt-badge mb-2">
                              <span class="badge badge-lg"
                                    [class.bg-success]="session.sessionState === 'completed'"
                                    [class.bg-warning]="session.sessionState === 'manually_ended'"
                                    [class.bg-danger]="session.sessionState === 'abandoned'">
                                Attempt {{session.attemptNumber || i + 1}}
                              </span>
                            </div>
                            <small class="text-muted">{{formatDate(session.createdAt)}}</small>
                          </div>
                        </div>
                        
                        <div class="col-md-3">
                          <div class="session-metrics">
                            <div><strong>💬 {{session.summary.conversationCount}} conversations</strong></div>
                            <div><small>⏱️ {{session.summary.timeSpentMinutes}} minutes</small></div>
                            <div><small>🎯 {{session.summary.totalScore}} points</small></div>
                          </div>
                        </div>
                        
                        <div class="col-md-4">
                          <div class="vocabulary-section">
                            <div><strong>📚 Vocabulary ({{session.summary.vocabularyUsed.length}} words):</strong></div>
                            <div class="vocabulary-tags">
                              <span *ngFor="let word of session.summary.vocabularyUsed.slice(0, 5)" 
                                    class="badge bg-light text-dark me-1 mb-1">{{word}}</span>
                              <span *ngIf="session.summary.vocabularyUsed.length > 5" 
                                    class="badge bg-secondary">+{{session.summary.vocabularyUsed.length - 5}} more</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="col-md-2">
                          <div class="session-status text-center">
                            <div class="status-icon mb-2">
                              <i class="fas fa-check-circle text-success" 
                                 *ngIf="session.sessionState === 'completed'"></i>
                              <i class="fas fa-pause-circle text-warning" 
                                 *ngIf="session.sessionState === 'manually_ended'"></i>
                              <i class="fas fa-times-circle text-danger" 
                                 *ngIf="session.sessionState === 'abandoned'"></i>
                            </div>
                            <small class="status-text">
                              {{getSessionStatusLabel(session.sessionState)}}
                            </small>
                          </div>
                        </div>
                        
                        <div class="col-md-1">
                          <button class="btn btn-outline-primary btn-sm" 
                                  (click)="viewSessionDetails(session.sessionId)">
                            <i class="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                      
                      <!-- Improvement indicator -->
                      <div *ngIf="i > 0 && getImprovementIndicator(session, moduleGroup.sessions[i-1]) as improvement" 
                           class="improvement-indicator mt-2 p-2 rounded"
                           [class.bg-success]="improvement.type === 'improved'"
                           [class.bg-warning]="improvement.type === 'declined'"
                           [class.text-white]="improvement.type === 'improved'"
                           [class.text-dark]="improvement.type === 'declined'">
                        <small>
                          <i class="fas fa-arrow-up" *ngIf="improvement.type === 'improved'"></i>
                          <i class="fas fa-arrow-down" *ngIf="improvement.type === 'declined'"></i>
                          {{improvement.message}}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No sessions message -->
              <div *ngIf="sessionHistory.length === 0 && !isLoading" class="text-center py-5">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No session history yet</h5>
                <p class="text-muted">Start practicing with modules to see your performance history here!</p>
                <button class="btn btn-primary" (click)="goToModules()">
                  <i class="fas fa-play"></i> Start Learning
                </button>
              </div>

              <!-- Loading indicator -->
              <div *ngIf="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading your performance history...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Details Modal -->
    <div class="modal fade" id="sessionDetailsModal" tabindex="-1" *ngIf="selectedSessionDetails">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              📊 Session Details - {{selectedSessionDetails.module.title}}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Session Summary -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>📋 Session Summary</h6>
                <ul class="list-unstyled">
                  <li><strong>💬 Conversations:</strong> {{selectedSessionDetails.summary.conversationCount}}</li>
                  <li><strong>⏱️ Time Spent:</strong> {{selectedSessionDetails.summary.timeSpentMinutes}} minutes</li>
                  <li><strong>🎯 Total Score:</strong> {{selectedSessionDetails.summary.totalScore}}</li>
                  <li><strong>✅ Accuracy:</strong> {{selectedSessionDetails.summary.accuracy}}%</li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6>📚 Vocabulary Learned</h6>
                <div class="vocabulary-display">
                  <span *ngFor="let word of selectedSessionDetails.summary.vocabularyUsed" 
                        class="badge bg-primary me-1 mb-1">{{word}}</span>
                  <div *ngIf="selectedSessionDetails.summary.vocabularyUsed.length === 0" 
                       class="text-muted">No vocabulary recorded</div>
                </div>
              </div>
            </div>

            <!-- Performance Breakdown -->
            <div class="mb-4">
              <h6>📈 Performance Breakdown</h6>
              <div class="row">
                <div class="col-md-4">
                  <div class="text-center p-3 bg-light rounded">
                    <h5 class="text-primary">{{selectedSessionDetails.summary.exerciseScore}}</h5>
                    <small>Exercise Score</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="text-center p-3 bg-light rounded">
                    <h5 class="text-success">{{selectedSessionDetails.summary.conversationScore}}</h5>
                    <small>Conversation Score</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="text-center p-3 bg-light rounded">
                    <h5 class="text-info">{{selectedSessionDetails.summary.correctAnswers}}/{{selectedSessionDetails.summary.correctAnswers + selectedSessionDetails.summary.incorrectAnswers}}</h5>
                    <small>Correct Answers</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" (click)="retryModule(selectedSessionDetails.module.id)">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      transition: transform 0.2s;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .stat-card:hover {
      transform: translateY(-2px);
    }
    .bg-purple {
      background-color: #6f42c1 !important;
    }
    .module-group {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      overflow: hidden;
    }
    .sessions-timeline {
      background: white;
    }
    .session-card {
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }
    .session-card:hover {
      background-color: #f8f9fa !important;
    }
    .session-card:last-child {
      border-bottom: none;
    }
    .attempt-badge .badge-lg {
      font-size: 0.9em;
      padding: 0.5em 0.8em;
    }
    .vocabulary-tags {
      max-height: 60px;
      overflow-y: auto;
    }
    .improvement-indicator {
      margin-left: 2rem;
      border-left: 3px solid #28a745;
    }
    .status-icon i {
      font-size: 1.5em;
    }
    .vocabulary-display {
      max-height: 120px;
      overflow-y: auto;
    }
  `]
})
export class PerformanceHistoryComponent implements OnInit {
  sessionHistory: SessionHistory[] = [];
  groupedSessions: any[] = [];
  availableModules: any[] = [];
  selectedModule: string = '';
  stats: PerformanceStats | null = null;
  selectedSessionDetails: SessionHistory | null = null;
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvailableModules();
    this.loadHistory();
  }

  loadAvailableModules(): void {
    this.http.get(`${environment.apiUrl}/learning-modules`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.availableModules = response.modules || [];
        },
        error: (error) => {
          console.error('Error loading modules:', error);
        }
      });
  }

  loadHistory(): void {
    this.isLoading = true;
    
    // Get current user's session records
    this.http.get(`${environment.apiUrl}/session-records/my-history`, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        this.sessionHistory = response.sessionHistory || [];
        this.stats = response.stats;
        this.groupSessionsByModule();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading session history:', error);
        this.isLoading = false;
      }
    });
  }

  groupSessionsByModule(): void {
    const grouped = this.sessionHistory.reduce((acc: any, session) => {
      const moduleId = session.module.id;
      if (!acc[moduleId]) {
        acc[moduleId] = {
          moduleId: moduleId,
          moduleTitle: session.module.title,
          moduleLevel: session.module.level,
          moduleCategory: session.module.category,
          sessions: []
        };
      }
      acc[moduleId].sessions.push(session);
      return acc;
    }, {});

    // Convert to array and sort sessions by date
    this.groupedSessions = Object.values(grouped).map((group: any) => {
      group.sessions.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      // Add attempt numbers
      group.sessions.forEach((session: any, index: number) => {
        session.attemptNumber = index + 1;
      });
      return group;
    });

    // Sort groups by most recent activity
    this.groupedSessions.sort((a, b) => {
      const aLatest = Math.max(...a.sessions.map((s: any) => new Date(s.createdAt).getTime()));
      const bLatest = Math.max(...b.sessions.map((s: any) => new Date(s.createdAt).getTime()));
      return bLatest - aLatest;
    });
  }

  viewSessionDetails(sessionId: string): void {
    const session = this.sessionHistory.find(s => s.sessionId === sessionId);
    if (session) {
      this.selectedSessionDetails = session;
      // Open modal (you might need to use Bootstrap JS or Angular Material)
      const modal = new (window as any).bootstrap.Modal(document.getElementById('sessionDetailsModal'));
      modal.show();
    }
  }

  retryModule(moduleId: string): void {
    this.router.navigate(['/ai-tutor-chat'], {
      queryParams: { moduleId, sessionType: 'practice' }
    });
  }

  goToModules(): void {
    this.router.navigate(['/learning-modules']);
  }

  getSessionStatusLabel(state: string): string {
    switch (state) {
      case 'completed': return 'Completed';
      case 'manually_ended': return 'Stopped Early';
      case 'abandoned': return 'Abandoned';
      case 'active': return 'In Progress';
      default: return state;
    }
  }

  getTrendLabel(trend: string): string {
    switch (trend) {
      case 'improving': return 'Improving';
      case 'stable': return 'Stable';
      case 'declining': return 'Needs Focus';
      default: return trend;
    }
  }

  getImprovementIndicator(currentSession: SessionHistory, previousSession: SessionHistory): any {
    const currentScore = currentSession.summary.totalScore;
    const previousScore = previousSession.summary.totalScore;
    const scoreDiff = currentScore - previousScore;

    if (scoreDiff > 10) {
      return {
        type: 'improved',
        message: `Improved by ${scoreDiff} points! Great progress! 🎉`
      };
    } else if (scoreDiff < -10) {
      return {
        type: 'declined',
        message: `Score decreased by ${Math.abs(scoreDiff)} points. Keep practicing! 💪`
      };
    }
    return null;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  formatTimeSpent(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}