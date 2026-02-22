// src/app/components/admin-dashboard/ai-usage-analytics/ai-usage-analytics.component.ts
// Enhanced AI Usage Analytics with Charts and Detailed Views

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AdminAnalyticsService } from '../../../services/admin-analytics.service';

interface StudentAIUsage {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBatch: string;
  studentLevel: string;
  totalSessions: number;
  totalTimeMinutes: number;
  completedSessions: number;
  completionRate: number;
  averageScore: number;
  modulesUsed: number;
  lastSessionDate: Date;
  vocabularyLearned: number;
  totalVocabulary: number; // Total vocabulary words used
}

interface ModuleUsageSummary {
  moduleId: string;
  moduleName: string;
  moduleLevel: string;
  totalSessions: number;
  totalTimeMinutes: number;
  uniqueStudents: number;
  averageScore: number;
  totalVocabulary: number; // Total vocabulary words used in this module
}

@Component({
  selector: 'app-ai-usage-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './ai-usage-analytics.component.html',
  styleUrls: ['./ai-usage-analytics.component.css']
})
export class AiUsageAnalyticsComponent implements OnInit {
  // Data
  studentUsageData: StudentAIUsage[] = [];
  moduleUsageData: ModuleUsageSummary[] = [];
  selectedStudent: StudentAIUsage | null = null;
  studentDetailedSessions: any[] = [];
  
  // Summary statistics
  totalStudentsUsingAI = 0;
  totalAISessionsCount = 0;
  totalAITimeHours = 0;
  averageSessionDuration = 0;
  overallCompletionRate = 0;
  
  // Loading states
  isLoading = false;
  isLoadingDetails = false;
  
  // View state
  showDetailedView = false;
  activeView: 'overview' | 'students' | 'modules' = 'overview';
  
  // Filters
  filters = {
    batch: '',
    level: '',
    dateFrom: '',
    dateTo: ''
  };
  
  availableBatches: string[] = [];
  availableLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  // Charts
  usageOverTimeChart: ChartConfiguration<'line'>['data'] | null = null;
  usageOverTimeOptions: ChartConfiguration<'line'>['options'];
  
  studentEngagementChart: ChartConfiguration<'bar'>['data'] | null = null;
  studentEngagementOptions: ChartConfiguration<'bar'>['options'];
  
  modulePopularityChart: ChartConfiguration<'doughnut'>['data'] | null = null;
  modulePopularityOptions: ChartConfiguration<'doughnut'>['options'];
  
  completionRateChart: ChartConfiguration<'bar'>['data'] | null = null;
  completionRateOptions: ChartConfiguration<'bar'>['options'];

  constructor(private adminAnalyticsService: AdminAnalyticsService) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadAIUsageData();
  }

  initializeChartOptions(): void {
    // Student Engagement Chart Options (Bar Chart)
    this.studentEngagementOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { 
          display: true, 
          text: 'Student Engagement Levels',
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.parsed.y} students`;
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Number of Students', font: { weight: 'bold' } }
        },
        x: { 
          title: { display: true, text: 'Engagement Level', font: { weight: 'bold' } }
        }
      }
    };

    // Module Popularity Chart Options (Doughnut Chart)
    this.modulePopularityOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true, 
          position: 'right',
          labels: { font: { size: 12 } }
        },
        title: { 
          display: true, 
          text: 'Most Popular AI Modules',
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value} sessions`;
            }
          }
        }
      }
    };

    // Level Distribution Chart Options (Bar Chart)
    this.completionRateOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { 
          display: true, 
          text: 'Students by CEFR Level',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Number of Students', font: { weight: 'bold' } }
        },
        x: { 
          title: { display: true, text: 'CEFR Level', font: { weight: 'bold' } }
        }
      }
    };

    // Usage Over Time Chart Options (not used currently but kept for future)
    this.usageOverTimeOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'AI Usage Trend (Last 30 Days)' }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Sessions' } },
        x: { title: { display: true, text: 'Date' } }
      }
    };
  }

  async loadAIUsageData(): Promise<void> {
    this.isLoading = true;
    
    try {
      // Build filters - IMPORTANT: Add studentsOnly flag
      const filters: any = { 
        groupBy: 'student',
        studentsOnly: 'true' // NEW: Only fetch STUDENT role users
      };
      if (this.filters.batch) filters.batch = this.filters.batch;
      if (this.filters.level) filters.level = this.filters.level;
      if (this.filters.dateFrom) filters.dateFrom = this.filters.dateFrom;
      if (this.filters.dateTo) filters.dateTo = this.filters.dateTo;

      // Fetch student usage data
      const response = await this.adminAnalyticsService.getModuleUsage(filters).toPromise();
      
      if (response && response.data) {
        this.processStudentUsageData(response.data);
        this.calculateSummaryStatistics(response.data);
      }

      // Fetch module usage data
      const moduleFilters = { ...filters, groupBy: 'module' };
      const moduleResponse = await this.adminAnalyticsService.getModuleUsage(moduleFilters).toPromise();
      
      if (moduleResponse && moduleResponse.data) {
        this.processModuleUsageData(moduleResponse.data);
      }

      // Generate charts
      this.generateCharts();
      
    } catch (error) {
      console.error('Error loading AI usage data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  processStudentUsageData(data: any[]): void {
    this.studentUsageData = data.map(item => ({
      studentId: item._id.studentId,
      studentName: item._id.studentName,
      studentEmail: item._id.studentEmail || 'No email', // Get from backend
      studentBatch: item._id.studentBatch || 'Not assigned',
      studentLevel: item._id.studentLevel || 'Not set',
      totalSessions: item.totalSessions,
      totalTimeMinutes: item.totalTimeSpent,
      completedSessions: item.completedSessions,
      completionRate: item.completionRate,
      averageScore: item.averageScore,
      modulesUsed: item.sessions?.length || 0,
      lastSessionDate: item.sessions?.[0]?.date || new Date(),
      vocabularyLearned: item.totalVocabularyLearned || 0,
      totalVocabulary: item.totalVocabularyLearned || 0 // Same as vocabularyLearned
    })).sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes);
    
    console.log('✅ Processed student data (students only):', this.studentUsageData.length);
  }

  processModuleUsageData(data: any[]): void {
    this.moduleUsageData = data.map(item => ({
      moduleId: item._id.moduleId,
      moduleName: item._id.moduleName,
      moduleLevel: item._id.moduleLevel,
      totalSessions: item.totalSessions,
      totalTimeMinutes: item.totalTimeSpent,
      uniqueStudents: item.uniqueStudentCount,
      averageScore: item.averageScore,
      totalVocabulary: item.totalVocabularyLearned || 0 // Add vocabulary count
    })).sort((a, b) => b.totalSessions - a.totalSessions);
  }

  calculateSummaryStatistics(data: any[]): void {
    this.totalStudentsUsingAI = data.length;
    this.totalAISessionsCount = data.reduce((sum, item) => sum + item.totalSessions, 0);
    const totalMinutes = data.reduce((sum, item) => sum + item.totalTimeSpent, 0);
    this.totalAITimeHours = Math.round(totalMinutes / 60);
    this.averageSessionDuration = this.totalAISessionsCount > 0 
      ? Math.round(totalMinutes / this.totalAISessionsCount) 
      : 0;
    
    const totalCompleted = data.reduce((sum, item) => sum + item.completedSessions, 0);
    this.overallCompletionRate = this.totalAISessionsCount > 0
      ? Math.round((totalCompleted / this.totalAISessionsCount) * 100)
      : 0;
  }

  generateCharts(): void {
    this.generateEngagementLevelChart();
    this.generateModulePopularityChart();
    this.generateLevelDistributionChart();
    this.generateSessionSuccessChart();
  }

  generateEngagementLevelChart(): void {
    // Categorize students by engagement level
    const highEngagement = this.studentUsageData.filter(s => s.totalTimeMinutes >= 60).length;
    const mediumEngagement = this.studentUsageData.filter(s => s.totalTimeMinutes >= 30 && s.totalTimeMinutes < 60).length;
    const lowEngagement = this.studentUsageData.filter(s => s.totalTimeMinutes < 30).length;
    
    this.studentEngagementChart = {
      labels: ['High Engagement (60+ min)', 'Medium Engagement (30-59 min)', 'Low Engagement (<30 min)'],
      datasets: [{
        label: 'Number of Students',
        data: [highEngagement, mediumEngagement, lowEngagement],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2
      }]
    };
  }

  generateModulePopularityChart(): void {
    const top6Modules = this.moduleUsageData.slice(0, 6);
    
    this.modulePopularityChart = {
      labels: top6Modules.map(m => m.moduleName),
      datasets: [{
        data: top6Modules.map(m => m.totalSessions),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }]
    };
  }

  generateLevelDistributionChart(): void {
    // Count students by level
    const levelCounts = new Map<string, number>();
    this.studentUsageData.forEach(student => {
      const level = student.studentLevel;
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    });

    const levels = Array.from(levelCounts.keys()).sort();
    const counts = levels.map(level => levelCounts.get(level) || 0);

    this.completionRateChart = {
      labels: levels,
      datasets: [{
        label: 'Number of Students',
        data: counts,
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2
      }]
    };
  }

  generateSessionSuccessChart(): void {
    // This will be used for a new chart showing session success metrics
    // We'll add this in the HTML
  }

  async viewStudentDetails(student: StudentAIUsage): Promise<void> {
    this.selectedStudent = student;
    this.showDetailedView = true;
    this.isLoadingDetails = true;

    try {
      // Fetch detailed session data for this student
      const response = await this.adminAnalyticsService.getStudentModuleDetails({
        studentId: student.studentId
      }).toPromise();

      if (response && response.detailedUsage) {
        this.studentDetailedSessions = response.detailedUsage;
      }
    } catch (error) {
      console.error('Error loading student details:', error);
    } finally {
      this.isLoadingDetails = false;
    }
  }

  closeDetailedView(): void {
    this.showDetailedView = false;
    this.selectedStudent = null;
    this.studentDetailedSessions = [];
  }

  setActiveView(view: 'overview' | 'students' | 'modules'): void {
    this.activeView = view;
  }

  applyFilters(): void {
    this.loadAIUsageData();
  }

  clearFilters(): void {
    this.filters = {
      batch: '',
      level: '',
      dateFrom: '',
      dateTo: ''
    };
    this.loadAIUsageData();
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  getCompletionRateColor(rate: number): string {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    if (rate >= 40) return '#fd7e14';
    return '#dc3545';
  }

  exportData(): void {
    const exportData = this.studentUsageData.map(student => ({
      'Student Name': student.studentName,
      'Email': student.studentEmail,
      'Batch': student.studentBatch,
      'Level': student.studentLevel,
      'Total Sessions': student.totalSessions,
      'Total Time (hours)': Math.round(student.totalTimeMinutes / 60 * 10) / 10,
      'Completed Sessions': student.completedSessions,
      'Completion Rate (%)': Math.round(student.completionRate),
      'Average Score': Math.round(student.averageScore),
      'Modules Used': student.modulesUsed,
      'Vocabulary Learned': student.vocabularyLearned,
      'Last Session': this.formatDate(student.lastSessionDate)
    }));

    this.adminAnalyticsService.exportToCSV(exportData, 'ai_usage_analytics');
  }
}
