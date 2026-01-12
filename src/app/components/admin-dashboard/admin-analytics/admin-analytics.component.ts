// src/app/components/admin-dashboard/admin-analytics/admin-analytics.component.ts
// Comprehensive Admin Analytics Dashboard

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AdminAnalyticsService, 
  ModuleUsageData, 
  TeacherPerformance, 
  BatchStats,
  DetailedUsage 
} from '../../../services/admin-analytics.service';
import { LearningModulesService } from '../../../services/learning-modules.service';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  Math = Math; // Add Math for template usage
  
  // Data properties
  moduleUsageData: ModuleUsageData[] = [];
  teacherPerformanceData: TeacherPerformance[] = [];
  batchStatsData: BatchStats[] = [];
  detailedUsageData: DetailedUsage[] = [];
  
  // Summary data
  moduleUsageSummary: any = {};
  teacherPerformanceSummary: any = {};
  
  // Loading states
  isLoadingModuleUsage = false;
  isLoadingTeacherPerformance = false;
  isLoadingDetailedUsage = false;
  
  // Filter options
  availableModules: any[] = [];
  availableTeachers: any[] = [];
  availableBatches: string[] = [];
  availableLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  // Active tab
  activeTab: 'module-usage' | 'teacher-performance' | 'detailed-usage' = 'module-usage';
  
  // Filters
  moduleUsageFilters = {
    moduleId: '',
    teacherId: '',
    batch: '',
    level: '',
    dateFrom: '',
    dateTo: '',
    groupBy: 'module' as 'module' | 'teacher' | 'batch' | 'student'
  };
  
  teacherPerformanceFilters = {
    teacherId: '',
    batch: '',
    dateFrom: '',
    dateTo: ''
  };
  
  detailedUsageFilters = {
    moduleId: '',
    studentId: '',
    teacherId: '',
    batch: ''
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  
  // Sorting
  sortBy = '';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private adminAnalyticsService: AdminAnalyticsService,
    private learningModulesService: LearningModulesService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadModuleUsage();
  }

  loadFilterOptions(): void {
    // Load modules
    this.learningModulesService.getModules({ limit: 1000 }).subscribe({
      next: (response) => {
        this.availableModules = response.modules || [];
      },
      error: (error) => {
        console.error('Error loading modules:', error);
      }
    });

    // Load teachers
    this.teacherService.getAllTeachers().subscribe({
      next: (response) => {
        this.availableTeachers = response.data || [];
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
      }
    });

    // Load batches (you might want to create a separate endpoint for this)
    this.availableBatches = ['2024-A', '2024-B', '2024-C', '2025-A', '2025-B'];
  }

  // Tab management
  setActiveTab(tab: 'module-usage' | 'teacher-performance' | 'detailed-usage'): void {
    this.activeTab = tab;
    
    switch (tab) {
      case 'module-usage':
        if (this.moduleUsageData.length === 0) {
          this.loadModuleUsage();
        }
        break;
      case 'teacher-performance':
        if (this.teacherPerformanceData.length === 0) {
          this.loadTeacherPerformance();
        }
        break;
      case 'detailed-usage':
        if (this.detailedUsageData.length === 0) {
          this.loadDetailedUsage();
        }
        break;
    }
  }

  // Data loading methods
  loadModuleUsage(): void {
    this.isLoadingModuleUsage = true;
    
    const filters = { ...this.moduleUsageFilters };
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    this.adminAnalyticsService.getModuleUsage(filters).subscribe({
      next: (response) => {
        this.moduleUsageData = response.data;
        this.moduleUsageSummary = response.summary;
        this.isLoadingModuleUsage = false;
        console.log('Module usage data loaded:', response);
      },
      error: (error) => {
        console.error('Error loading module usage:', error);
        this.isLoadingModuleUsage = false;
      }
    });
  }

  loadTeacherPerformance(): void {
    this.isLoadingTeacherPerformance = true;
    
    const filters = { ...this.teacherPerformanceFilters };
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    this.adminAnalyticsService.getTeacherPerformance(filters).subscribe({
      next: (response) => {
        this.teacherPerformanceData = response.teacherPerformance;
        this.batchStatsData = response.batchStats;
        this.teacherPerformanceSummary = response.summary;
        this.isLoadingTeacherPerformance = false;
        console.log('Teacher performance data loaded:', response);
      },
      error: (error) => {
        console.error('Error loading teacher performance:', error);
        this.isLoadingTeacherPerformance = false;
      }
    });
  }

  loadDetailedUsage(): void {
    this.isLoadingDetailedUsage = true;
    
    const filters = { ...this.detailedUsageFilters };
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    this.adminAnalyticsService.getStudentModuleDetails(filters).subscribe({
      next: (response) => {
        this.detailedUsageData = response.detailedUsage;
        this.isLoadingDetailedUsage = false;
        console.log('Detailed usage data loaded:', response);
      },
      error: (error) => {
        console.error('Error loading detailed usage:', error);
        this.isLoadingDetailedUsage = false;
      }
    });
  }

  // Filter methods
  applyModuleUsageFilters(): void {
    this.loadModuleUsage();
  }

  applyTeacherPerformanceFilters(): void {
    this.loadTeacherPerformance();
  }

  applyDetailedUsageFilters(): void {
    this.loadDetailedUsage();
  }

  clearModuleUsageFilters(): void {
    this.moduleUsageFilters = {
      moduleId: '',
      teacherId: '',
      batch: '',
      level: '',
      dateFrom: '',
      dateTo: '',
      groupBy: 'module'
    };
    this.loadModuleUsage();
  }

  clearTeacherPerformanceFilters(): void {
    this.teacherPerformanceFilters = {
      teacherId: '',
      batch: '',
      dateFrom: '',
      dateTo: ''
    };
    this.loadTeacherPerformance();
  }

  clearDetailedUsageFilters(): void {
    this.detailedUsageFilters = {
      moduleId: '',
      studentId: '',
      teacherId: '',
      batch: ''
    };
    this.loadDetailedUsage();
  }

  // Utility methods
  formatTimeSpent(minutes: number): string {
    return this.adminAnalyticsService.formatTimeSpent(minutes);
  }

  formatDate(date: Date | string): string {
    return this.adminAnalyticsService.formatDate(date);
  }

  formatDateTime(date: Date | string): string {
    return this.adminAnalyticsService.formatDateTime(date);
  }

  getCompletionRateColor(rate: number): string {
    return this.adminAnalyticsService.getCompletionRateColor(rate);
  }

  getScoreColor(score: number): string {
    return this.adminAnalyticsService.getScoreColor(score);
  }

  // Export methods
  exportModuleUsage(): void {
    const exportData = this.moduleUsageData.map(item => ({
      'Module/Group': this.getDisplayName(item._id),
      'Total Sessions': item.totalSessions,
      'Total Time (minutes)': item.totalTimeSpent,
      'Completed Sessions': item.completedSessions,
      'Completion Rate (%)': Math.round(item.completionRate),
      'Average Score': Math.round(item.averageScore),
      'Unique Students': item.uniqueStudentCount,
      'Avg Time per Student (minutes)': Math.round(item.averageTimePerStudent),
      'Vocabulary Learned': item.totalVocabularyLearned
    }));
    
    this.adminAnalyticsService.exportToCSV(exportData, 'module_usage_analytics');
  }

  exportTeacherPerformance(): void {
    const exportData = this.teacherPerformanceData.map(teacher => ({
      'Teacher Name': teacher._id.teacherName,
      'Teacher Email': teacher._id.teacherEmail,
      'Total Time (minutes)': teacher.totalTimeSpent,
      'Total Sessions': teacher.totalSessions,
      'Completed Sessions': teacher.totalCompletedSessions,
      'Completion Rate (%)': Math.round(teacher.overallCompletionRate),
      'Average Score': Math.round(teacher.averageScore),
      'Total Students': teacher.totalStudents,
      'Avg Time per Student (minutes)': Math.round(teacher.averageTimePerStudent),
      'Modules Taught': teacher.modulePerformance.length
    }));
    
    this.adminAnalyticsService.exportToCSV(exportData, 'teacher_performance_analytics');
  }

  exportDetailedUsage(): void {
    const exportData = this.detailedUsageData.map(session => ({
      'Session ID': session.sessionId,
      'Student Name': session.studentName,
      'Student Batch': session.studentBatch,
      'Student Level': session.studentLevel,
      'Teacher Name': session.teacherName,
      'Module Name': session.moduleName,
      'Module Level': session.moduleLevel,
      'Session Type': session.sessionType,
      'Duration (minutes)': session.durationMinutes,
      'Status': session.sessionState,
      'Score': session.summary?.totalScore || 0,
      'Date': this.formatDateTime(session.createdAt)
    }));
    
    this.adminAnalyticsService.exportToCSV(exportData, 'detailed_usage_analytics');
  }

  // Sorting methods
  sortData(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }
    
    // Apply sorting based on active tab
    switch (this.activeTab) {
      case 'module-usage':
        this.sortModuleUsageData();
        break;
      case 'teacher-performance':
        this.sortTeacherPerformanceData();
        break;
      case 'detailed-usage':
        this.sortDetailedUsageData();
        break;
    }
  }

  private sortModuleUsageData(): void {
    this.moduleUsageData.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = this.getDisplayName(a._id).toLowerCase();
          bValue = this.getDisplayName(b._id).toLowerCase();
          break;
        case 'totalSessions':
          aValue = a.totalSessions;
          bValue = b.totalSessions;
          break;
        case 'totalTimeSpent':
          aValue = a.totalTimeSpent;
          bValue = b.totalTimeSpent;
          break;
        case 'completionRate':
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case 'averageScore':
          aValue = a.averageScore;
          bValue = b.averageScore;
          break;
        default:
          return 0;
      }
      
      if (this.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private sortTeacherPerformanceData(): void {
    this.teacherPerformanceData.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'teacherName':
          aValue = a._id.teacherName.toLowerCase();
          bValue = b._id.teacherName.toLowerCase();
          break;
        case 'totalTimeSpent':
          aValue = a.totalTimeSpent;
          bValue = b.totalTimeSpent;
          break;
        case 'totalSessions':
          aValue = a.totalSessions;
          bValue = b.totalSessions;
          break;
        case 'completionRate':
          aValue = a.overallCompletionRate;
          bValue = b.overallCompletionRate;
          break;
        case 'averageScore':
          aValue = a.averageScore;
          bValue = b.averageScore;
          break;
        default:
          return 0;
      }
      
      if (this.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private sortDetailedUsageData(): void {
    this.detailedUsageData.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'studentName':
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case 'moduleName':
          aValue = a.moduleName.toLowerCase();
          bValue = b.moduleName.toLowerCase();
          break;
        case 'durationMinutes':
          aValue = a.durationMinutes;
          bValue = b.durationMinutes;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }
      
      if (this.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  // Helper methods
  getDisplayName(idObject: any): string {
    if (idObject.moduleName) {
      return `${idObject.moduleName} (${idObject.moduleLevel})`;
    }
    if (idObject.teacherName) {
      return idObject.teacherName;
    }
    if (idObject.batch) {
      return `Batch ${idObject.batch}`;
    }
    if (idObject.studentName) {
      return `${idObject.studentName} (${idObject.studentLevel})`;
    }
    return 'Unknown';
  }

  // Pagination methods
  get paginatedData(): any[] {
    let data: any[] = [];
    
    switch (this.activeTab) {
      case 'module-usage':
        data = this.moduleUsageData;
        break;
      case 'teacher-performance':
        data = this.teacherPerformanceData;
        break;
      case 'detailed-usage':
        data = this.detailedUsageData;
        break;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    let dataLength = 0;
    
    switch (this.activeTab) {
      case 'module-usage':
        dataLength = this.moduleUsageData.length;
        break;
      case 'teacher-performance':
        dataLength = this.teacherPerformanceData.length;
        break;
      case 'detailed-usage':
        dataLength = this.detailedUsageData.length;
        break;
    }
    
    return Math.ceil(dataLength / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}