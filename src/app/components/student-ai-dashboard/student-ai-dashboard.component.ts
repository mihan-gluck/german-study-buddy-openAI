// src/app/components/student-ai-dashboard/student-ai-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentProgressService, DashboardAnalytics } from '../../services/student-progress.service';
import { LearningModulesService } from '../../services/learning-modules.service';
import { AiTutorService } from '../../services/ai-tutor.service';

@Component({
  selector: 'app-student-ai-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-ai-dashboard.component.html',
  styleUrls: ['./student-ai-dashboard.component.css']
})
export class StudentAiDashboardComponent implements OnInit {
  analytics: DashboardAnalytics | null = null;
  recentModules: any[] = [];
  isLoading: boolean = true;
  
  constructor(
    private studentProgressService: StudentProgressService,
    private learningModulesService: LearningModulesService,
    private aiTutorService: AiTutorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load analytics
    this.studentProgressService.getDashboardAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard analytics:', error);
        this.isLoading = false;
      }
    });
    
    // Load recent modules
    this.learningModulesService.getModules({ limit: 6 }).subscribe({
      next: (response) => {
        this.recentModules = response.modules.filter((m: any) => m.studentProgress);
      },
      error: (error) => {
        console.error('Error loading recent modules:', error);
      }
    });
  }

  navigateToModules(): void {
    this.router.navigate(['/learning-modules']);
  }

  startQuickTutoring(moduleId: string): void {
    this.router.navigate(['/ai-tutor-chat'], {
      queryParams: { moduleId, sessionType: 'practice' }
    });
  }

  viewProgress(): void {
    this.router.navigate(['/student-progress']);
  }

  testAudio(): void {
    this.router.navigate(['/audio-test']);
  }

  getProgressPercentage(completed: number, total: number): number {
    return this.studentProgressService.calculateCompletionPercentage(completed, total);
  }

  formatTimeSpent(minutes: number): string {
    return this.studentProgressService.formatTimeSpent(minutes);
  }

  getWeeklyActivityData(): any[] {
    if (!this.analytics?.weeklyActivity) return [];
    
    return Object.entries(this.analytics.weeklyActivity).map(([day, data]: [string, any]) => ({
      day,
      sessions: data.sessions,
      timeSpent: data.timeSpent
    }));
  }

  getLevelProgressData(): any[] {
    if (!this.analytics?.progressByLevel) return [];
    
    return Object.entries(this.analytics.progressByLevel).map(([level, data]: [string, any]) => ({
      level,
      completed: data.completed,
      total: data.total,
      percentage: this.getProgressPercentage(data.completed, data.total)
    }));
  }

  getCategoryProgressData(): any[] {
    if (!this.analytics?.progressByCategory) return [];
    
    return Object.entries(this.analytics.progressByCategory).map(([category, data]: [string, any]) => ({
      category,
      completed: data.completed,
      total: data.total,
      percentage: this.getProgressPercentage(data.completed, data.total)
    }));
  }
}