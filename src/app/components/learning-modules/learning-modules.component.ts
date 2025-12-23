// src/app/components/learning-modules/learning-modules.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LearningModulesService, LearningModule, ModuleFilters } from '../../services/learning-modules.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionGuardService, SubscriptionStatus } from '../../services/subscription-guard.service';

@Component({
  selector: 'app-learning-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learning-modules.component.html',
  styleUrls: ['./learning-modules.component.css']
})
export class LearningModulesComponent implements OnInit {
  modules: LearningModule[] = [];
  filteredModules: LearningModule[] = [];
  isLoading: boolean = false;
  currentUser: any = null;
  
  // Filters
  filters: ModuleFilters = {
    level: '',
    category: '',
    difficulty: '',
    targetLanguage: '',
    nativeLanguage: '',
    search: '',
    page: 1,
    limit: 12
  };
  
  // Pagination
  pagination = {
    current: 1,
    pages: 1,
    total: 0
  };
  
  // Filter options
  levels: string[] = [];
  categories: string[] = [];
  difficulties: string[] = [];
  targetLanguages: string[] = [];
  nativeLanguages: string[] = [];
  
  // View mode
  viewMode: 'grid' | 'list' = 'grid';
  
  constructor(
    private learningModulesService: LearningModulesService,
    private authService: AuthService,
    private subscriptionGuard: SubscriptionGuardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeFilterOptions();
    this.loadCurrentUser();
    this.loadModules();
  }

  initializeFilterOptions(): void {
    this.levels = this.learningModulesService.getAvailableLevels();
    this.categories = this.learningModulesService.getAvailableCategories();
    this.difficulties = this.learningModulesService.getAvailableDifficulties();
    this.targetLanguages = this.learningModulesService.getAvailableLanguages();
    this.nativeLanguages = this.learningModulesService.getAvailableNativeLanguages();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadModules(): void {
    this.isLoading = true;
    
    this.learningModulesService.getModules(this.filters).subscribe({
      next: (response) => {
        this.modules = response.modules;
        this.filteredModules = response.modules;
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.isLoading = false;
        alert('Failed to load learning modules');
      }
    });
  }

  applyFilters(): void {
    this.filters.page = 1; // Reset to first page
    this.loadModules();
  }

  clearFilters(): void {
    this.filters = {
      level: '',
      category: '',
      difficulty: '',
      targetLanguage: '',
      nativeLanguage: '',
      search: '',
      page: 1,
      limit: 12
    };
    this.loadModules();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadModules();
  }

  enrollInModule(module: LearningModule): void {
    if (!module._id) return;
    
    this.learningModulesService.enrollInModule(module._id).subscribe({
      next: (response) => {
        alert('Successfully enrolled in module!');
        // Reload modules to update enrollment status
        this.loadModules();
      },
      error: (error) => {
        console.error('Error enrolling in module:', error);
        if (error.status === 400) {
          alert('You are already enrolled in this module');
        } else {
          alert('Failed to enroll in module');
        }
      }
    });
  }

  startTutoring(module: LearningModule, sessionType: string = 'practice'): void {
    if (!module._id) return;
    
    // Check if user has PLATINUM subscription for AI tutoring
    this.subscriptionGuard.checkPlatinumAccess().subscribe((status: SubscriptionStatus) => {
      if (status.hasAccess) {
        // Check if enrolled
        if (!module.studentProgress) {
          this.enrollInModule(module);
          return;
        }
        
        // User has PLATINUM access, proceed to AI tutoring
        this.router.navigate(['/ai-tutor-chat'], {
          queryParams: {
            moduleId: module._id,
            sessionType: sessionType
          }
        });
      } else {
        // User doesn't have PLATINUM access, show upgrade message
        this.showSubscriptionUpgradeDialog(status);
      }
    });
  }

  private showSubscriptionUpgradeDialog(status: SubscriptionStatus): void {
    const upgradeMessage = `🤖 AI Tutoring - Premium Feature\n\n` +
      `${status.message}\n\n` +
      `AI Tutoring Features:\n` +
      `• Voice conversation with AI tutor\n` +
      `• Real-time dialogue bubbles\n` +
      `• Personalized learning experience\n` +
      `• Role-play scenarios\n` +
      `• Engagement scoring\n\n` +
      `Current: ${status.currentSubscription || 'No subscription'}\n` +
      `Required: ${status.requiredSubscription}\n\n` +
      `Would you like to upgrade to PLATINUM?`;

    if (confirm(upgradeMessage)) {
      // Redirect to subscription upgrade page
      this.router.navigate(['/subscriptions']);
    }
  }

  // Check if user can access AI tutoring
  canAccessAiTutoring(): boolean {
    return this.subscriptionGuard.isPlatinum() || this.currentUser?.role !== 'STUDENT';
  }

  // Get subscription badge text
  getSubscriptionBadge(): string {
    const subscription = this.subscriptionGuard.getCurrentSubscription();
    return subscription || 'No Subscription';
  }

  // Check if user is student
  isStudent(): boolean {
    return this.currentUser?.role === 'STUDENT';
  }

  viewModuleDetails(module: LearningModule): void {
    if (!module._id) return;
    // For now, show module details in an alert
    alert(`Module: ${module.title}\nLevel: ${module.level}\nCategory: ${module.category}\nDescription: ${module.description}`);
  }

  getProgressPercentage(module: LearningModule): number {
    return module.studentProgress?.progressPercentage || 0;
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'danger';
  }

  getStatusBadgeClass(module: LearningModule): string {
    if (!module.studentProgress) return 'badge-secondary';
    
    switch (module.studentProgress.status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-primary';
      case 'paused': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  getStatusText(module: LearningModule): string {
    if (!module.studentProgress) return 'Not Enrolled';
    
    switch (module.studentProgress.status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'paused': return 'Paused';
      default: return 'Not Started';
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'A1': return 'success';
      case 'A2': return 'info';
      case 'B1': return 'warning';
      case 'B2': return 'primary';
      case 'C1': return 'secondary';
      case 'C2': return 'dark';
      default: return 'light';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Grammar': return '📚';
      case 'Vocabulary': return '📝';
      case 'Conversation': return '💬';
      case 'Reading': return '📖';
      case 'Writing': return '✍️';
      case 'Listening': return '👂';
      default: return '📋';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  canEnroll(module: LearningModule): boolean {
    return this.currentUser?.role === 'STUDENT' && !module.studentProgress;
  }

  canStartTutoring(module: LearningModule): boolean {
    return this.currentUser?.role === 'STUDENT' && 
           module.studentProgress && 
           module.studentProgress.status !== 'completed';
  }

  isTeacherOrAdmin(): boolean {
    return this.currentUser?.role === 'TEACHER' || this.currentUser?.role === 'ADMIN';
  }

  createNewModule(): void {
    this.router.navigate(['/create-module']);
  }

  testAudio(): void {
    this.router.navigate(['/audio-test']);
  }

  editModule(module: LearningModule): void {
    if (!module._id) return;
    this.router.navigate(['/edit-module', module._id]);
  }

  getPaginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.pagination.current - 2);
    const end = Math.min(this.pagination.pages, this.pagination.current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}