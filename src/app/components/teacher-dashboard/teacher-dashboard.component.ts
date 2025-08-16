//src/app/components/teacher-dashboard/teacher-dashboard.component.ts

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';
import { CoursesService } from '../../services/courses.service';
import { CourseProgressService } from '../../services/course-progress.service';
import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-teacher-dashboard',
  standalone: false,
  
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})

export class TeacherDashboardComponent implements OnInit, AfterViewInit{
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  students: any[] = []; // List of students with name and ID
  selectedStudentId: string = '';
  feedbackList: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  filteredFeedback: any[] = [];
  selectedLevel: string = '';
  levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  startDate: string = '';
  endDate: string = '';

  studentCourses: any[] =[];

  newFeedback: any = {
    studentId: '',
    summary: '',
    fluency: '',
    accent: '',
    grammar: '',
    overallCFBR: '',
    commonMistakes: '',
    currentLevel: '',
    suggestedImprovement: ''
  };
    
    teacherName: string = '';
    saveProgress: any;
    studentProgress: any;
    //displayedColumns: Iterable<string>;
    displayedColumns: string[] = ['student', 'course', 'fluency', 'grammar', 'feedbackText', 'date'];
    feedbackText: any;
    studentId: any;
    courses: any;
    selectedCourse: any;
    exportFeedbackToCSV: any;
    averageScores: any;
    updateCourseProgress: any;
    feedback: any;

  constructor(
    private http: HttpClient,
    private feedbackService: FeedbackService,
    private coursesService: CoursesService,
    private courseProgressService: CourseProgressService,
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.fetchStudents();
  }

  getStudentNameById(id: string): string {
    const student = this.students.find(s => s._id === id);
    return student ? student.name : 'Unknown';
  }


  fetchStudents(): void {
    this.http.get('/api/admin/users?role=student').subscribe({
      next: (data: any) => {
        this.students = data;
      },
      error: err => {
        console.error('Failed to load students', err);
        this.error = 'Could not load student list.';
      }
    });
  }

  loadStudents(): void {
    this.feedbackService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (err) => {
        console.error('Failed to load students:', err);
      }
    });
  }

  // Use selectedStudentID in filtering and submitting feedback

  onStudentChange(): void {
  if (!this.selectedStudentId) return;
  this.loading = true;

  // Find the selected student name
  const selectedStudent = this.students.find(s => s._id === this.selectedStudentId);
  const studentName = selectedStudent ? selectedStudent.name : 'Unknown';

  this.feedbackService.getStudentFeedback(this.selectedStudentId).subscribe({
    next: (data: any) => {
      // Add studentName to each feedback item
      this.feedbackList = data.map((entry: any) => ({
        ...entry,
        studentName: studentName
      }));
      this.applyFilters();
      this.loading = false;
    },
    error: err => {
      console.error('Failed to load feedback', err);
      this.error = 'Could not load feedback.';
      this.loading = false;
    }
  });
}

  
  applyFilters(): void {
  let filtered = this.feedbackList;

  // Filter by level
  if (this.selectedLevel) {
    filtered = filtered.filter(fb => fb.currentLevel === this.selectedLevel);
  }

  // Filter by date
  if (this.startDate) {
    const start = new Date(this.startDate);
    filtered = filtered.filter(fb => new Date(fb.timestamp) >= start);
  }
  if (this.endDate) {
    const end = new Date(this.endDate);
    filtered = filtered.filter(fb => new Date(fb.timestamp) <= end);
  }

  this.filteredFeedback = filtered.slice(
    (this.currentPage - 1) * this.itemsPerPage,
    this.currentPage * this.itemsPerPage
  );
}



  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  onLevelChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedLevel = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  submitFeedback(): void {
  this.newFeedback.studentId = this.selectedStudentId; // 💡 ensure correct student
  this.feedbackService.submitFeedback(this.newFeedback).subscribe({
    next: (res) => {
      alert('Feedback submitted successfully!');
      this.newFeedback = {
        studentId: this.selectedStudentId,  // Keep it prefilled
        summary: '',
        fluency: '',
        accent: '',
        grammar: '',
        overallCFBR: '',
        commonMistakes: '',
        currentLevel: '',
        suggestedImprovement: ''
      };
      this.onStudentChange(); // 🔁 Reload feedback list
    },
    error: (err) => {
      console.error('Failed to submit feedback:', err);
    }
  });
}

exportToCSV(): void {
  const headers = [
    'Student Name', 'Timestamp', 'Summary', 'Conversation Time',
    'Fluency', 'Accent', 'Grammar', 'Overall CFBR',
    'Mistakes', 'Level', 'Suggestions'
  ];

  const rows = this.filteredFeedback.map(fb => [
    fb.studentName || fb.studentId, fb.timestamp, fb.summary, fb.conversationTime,
    fb.fluency, fb.accent, fb.grammar, fb.overallCfbr,
    fb.commonMistakes, fb.currentLevel, fb.suggestedImprovement
  ]);

  const csvContent = [
    headers.join(','), // CSV header
    ...rows.map(r => r.map(v => `"${v}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'feedback_export.csv');
  link.click();
}

getAverageScore(type: 'fluency' | 'grammar'): number {
  const relevant = this.filteredFeedback.filter(fb => fb[type] !== undefined && !isNaN(+fb[type]));
  const total = relevant.reduce((sum, fb) => sum + +fb[type], 0);
  return relevant.length ? (total / relevant.length) : 0;
}

// update a student's progress
updateProgress(studentId: string, courseId: string, newProgress: number): void {
    this.http.put('/api/teacher/update-progress', {
      studentId,
      courseId,
      progress: newProgress
    }).subscribe({
      next: () => alert('Progress updated successfully'),
      error: err => alert('Failed to update progress')
    });
  }
  
// view and update progress per course
fetchStudentCourses(studentId: string): void {
  this.http.get(`/api/teacher/student-courses/${studentId}`).subscribe({
    next: (data: any) => {
      this.studentCourses = data; // Each should have courseId, name, and current progress
    },
    error: err => {
      console.error('Failed to load student courses:', err);
    }
  });
}

// load teacher profile-data
 loadTeacherProfile(): void {
    this.http.get<any>('/api/teacher/profile').subscribe({
      next: (data) => {
        this.teacherName = data.name;
      },
      error: (err) => {
        console.error('Failed to load teacher profile', err);
      }
    });

  }



// Optionally update dataSource when feedbackList is received
  loadFeedback(feedbackList: any[]) {
    this.dataSource.data = feedbackList;
  }


public feedbackChartData: ChartConfiguration<'bar'>['data'] = {
  labels: ['Fluency', 'Grammar', 'Pronunciation'],
  datasets: [
    { data: [8.2, 7.5, 6.9], label: 'Average Score' }
  ]
};

public feedbackChartOptions: ChartConfiguration['options'] = {
  responsive: true,
};
public feedbackChartType: ChartType = 'bar';
    
}
