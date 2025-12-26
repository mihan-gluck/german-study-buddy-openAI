// src/app/components/student-progress/student-progress.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentProgressService, StudentProgress, ProgressStats } from '../../services/student-progress.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.css']
})
export class StudentProgressComponent implements OnInit {
  progress: StudentProgress[] = [];
  stats: ProgressStats | null = null;
  isLoading: boolean = true;
  
  // Filter options
  selectedStatus: string = '';
  selectedLevel: string = '';
  selectedCategory: string = '';

  constructor(
    private studentProgressService: StudentProgressService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress(): void {
    this.isLoading = true;
    
    const filters: any = {};
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedLevel) filters.level = this.selectedLevel;
    if (this.selectedCategory) filters.category = this.selectedCategory;
    
    this.studentProgressService.getProgress(filters).subscribe({
      next: (response) => {
        this.progress = response.progress;
        this.stats = response.stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadProgress();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedLevel = '';
    this.selectedCategory = '';
    this.loadProgress();
  }

  viewModuleDetails(moduleId: string): void {
    this.router.navigate(['/learning-modules']);
  }

  startTutoring(moduleId: string): void {
    this.router.navigate(['/ai-tutor-chat'], {
      queryParams: { moduleId, sessionType: 'practice' }
    });
  }

  getProgressColor(percentage: number): string {
    return this.studentProgressService.getStatusColor(
      percentage >= 100 ? 'completed' : 
      percentage > 0 ? 'in-progress' : 'not-started'
    );
  }

  getStatusIcon(status: string): string {
    return this.studentProgressService.getStatusIcon(status);
  }

  formatTimeSpent(minutes: number): string {
    return this.studentProgressService.formatTimeSpent(minutes);
  }

  calculateCompletionPercentage(completed: number, total: number): number {
    return this.studentProgressService.calculateCompletionPercentage(completed, total);
  }
}