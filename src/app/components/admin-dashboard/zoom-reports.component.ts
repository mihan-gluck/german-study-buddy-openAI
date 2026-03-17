// src/app/components/admin-dashboard/zoom-reports.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ZoomService } from '../../services/zoom.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface MeetingReport {
  _id: string;
  topic: string;
  batch: string;
  startTime: Date;
  duration: number;
  teacher: {
    name: string;
    email: string;
  };
  attendees: number;
  attended: number;
  absent: number;
  attendanceRate: number;
  avgCameraOn: number;
  avgMicOn: number;
  status: string;
}

@Component({
  selector: 'app-zoom-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  templateUrl: './zoom-reports.component.html',
  styleUrls: ['./zoom-reports.component.css']
})
export class ZoomReportsComponent implements OnInit {
  // Data
  allMeetings: any[] = [];
  completedMeetings: MeetingReport[] = [];
  filteredMeetings: MeetingReport[] = [];
  
  // Loading states
  loading = false;
  error = '';
  
  // Filters
  teacherFilter = 'all';
  batchFilter = 'all';
  dateFilter = 'all'; // all, today, week, month, custom
  customDateFrom: Date | null = null;
  customDateTo: Date | null = null;
  searchQuery = '';
  
  // Statistics
  stats = {
    totalMeetings: 0,
    totalStudents: 0,
    avgAttendance: 0,
    avgCameraOn: 0,
    totalDuration: 0
  };
  
  // Role
  isTeacherRole = false;

  // Table columns
  displayedColumns: string[] = [
    'date',
    'topic',
    'teacher',
    'batch',
    'duration',
    'attendance',
    'engagement',
    'actions'
  ];

  constructor(
    private zoomService: ZoomService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isTeacherRole = user.role === 'TEACHER';
        if (this.isTeacherRole) {
          this.displayedColumns = this.displayedColumns.filter(col => col !== 'teacher' && col !== 'actions');
        }
        this.loadCompletedMeetings();
      }
    });
  }

  loadCompletedMeetings(): void {
    this.loading = true;
    this.error = '';

    this.zoomService.getAllMeetings().subscribe({
      next: (response) => {
        if (response.success) {
          this.allMeetings = response.data;
          this.processCompletedMeetings();
          this.calculateStatistics();
          this.applyFilters();
        } else {
          this.error = response.message || 'Failed to load meetings';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading meetings:', err);
        this.error = 'Failed to load meeting reports';
        this.loading = false;
      }
    });
  }

  processCompletedMeetings(): void {
    const now = new Date();
    
    this.completedMeetings = this.allMeetings
      .filter(meeting => {
        const endTime = new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000);
        return endTime < now; // Meeting has ended
      })
      .map(meeting => {
        const attended = meeting.attendance?.filter((a: any) => a.attended).length || 0;
        const total = meeting.attendees?.length || 0;
        const absent = total - attended;
        
        return {
          _id: meeting._id,
          topic: meeting.topic,
          batch: meeting.batch,
          startTime: new Date(meeting.startTime),
          duration: meeting.duration,
          teacher: {
            name: meeting.createdBy?.name || 'Unknown',
            email: meeting.createdBy?.email || ''
          },
          attendees: total,
          attended: attended,
          absent: absent,
          attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0,
          avgCameraOn: 0, // Will be calculated if engagement data available
          avgMicOn: 0,
          status: 'completed'
        };
      })
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  calculateStatistics(): void {
    if (this.completedMeetings.length === 0) {
      this.stats = {
        totalMeetings: 0,
        totalStudents: 0,
        avgAttendance: 0,
        avgCameraOn: 0,
        totalDuration: 0
      };
      return;
    }

    // Count unique students across all completed meetings
    const uniqueStudentIds = new Set<string>();
    const completedMeetingIds = new Set(this.completedMeetings.map(m => m._id));
    this.allMeetings
      .filter(m => completedMeetingIds.has(m._id))
      .forEach(meeting => {
        meeting.attendees?.forEach((a: any) => {
          const id = a.studentId?._id || a.studentId;
          if (id) uniqueStudentIds.add(id.toString());
        });
      });

    const totalDuration = this.completedMeetings.reduce((sum, m) => sum + m.duration, 0);
    const avgAttendanceRate = this.completedMeetings.reduce((sum, m) => sum + m.attendanceRate, 0) / this.completedMeetings.length;

    this.stats = {
      totalMeetings: this.completedMeetings.length,
      totalStudents: uniqueStudentIds.size,
      avgAttendance: Math.round(avgAttendanceRate),
      avgCameraOn: 0,
      totalDuration: totalDuration
    };
  }

  applyFilters(): void {
    this.filteredMeetings = this.completedMeetings.filter(meeting => {
      // Teacher filter
      if (this.teacherFilter !== 'all' && meeting.teacher.name !== this.teacherFilter) {
        return false;
      }

      // Batch filter
      if (this.batchFilter !== 'all' && meeting.batch !== this.batchFilter) {
        return false;
      }

      // Date filter
      if (this.dateFilter !== 'all') {
        const now = new Date();
        const meetingDate = meeting.startTime;
        
        if (this.dateFilter === 'today') {
          if (meetingDate.toDateString() !== now.toDateString()) {
            return false;
          }
        } else if (this.dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (meetingDate < weekAgo) {
            return false;
          }
        } else if (this.dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (meetingDate < monthAgo) {
            return false;
          }
        } else if (this.dateFilter === 'custom') {
          if (this.customDateFrom) {
            const from = new Date(this.customDateFrom);
            from.setHours(0, 0, 0, 0);
            if (meetingDate < from) return false;
          }
          if (this.customDateTo) {
            const to = new Date(this.customDateTo);
            to.setHours(23, 59, 59, 999);
            if (meetingDate > to) return false;
          }
        }
      }

      // Search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          meeting.topic.toLowerCase().includes(query) ||
          meeting.teacher.name.toLowerCase().includes(query) ||
          meeting.batch.toLowerCase().includes(query)
        );
      }

      return true;
    });

    this.recalculateStats();
  }

  recalculateStats(): void {
    if (this.filteredMeetings.length === 0) {
      this.stats = { totalMeetings: 0, totalStudents: 0, avgAttendance: 0, avgCameraOn: 0, totalDuration: 0 };
      return;
    }

    const filteredIds = new Set(this.filteredMeetings.map(m => m._id));
    const uniqueStudentIds = new Set<string>();
    this.allMeetings
      .filter(m => filteredIds.has(m._id))
      .forEach(meeting => {
        meeting.attendees?.forEach((a: any) => {
          const id = a.studentId?._id || a.studentId;
          if (id) uniqueStudentIds.add(id.toString());
        });
      });

    const totalDuration = this.filteredMeetings.reduce((sum, m) => sum + m.duration, 0);
    const avgAttendanceRate = this.filteredMeetings.reduce((sum, m) => sum + m.attendanceRate, 0) / this.filteredMeetings.length;

    this.stats = {
      totalMeetings: this.filteredMeetings.length,
      totalStudents: uniqueStudentIds.size,
      avgAttendance: Math.round(avgAttendanceRate),
      avgCameraOn: 0,
      totalDuration: totalDuration
    };
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.teacherFilter = 'all';
    this.batchFilter = 'all';
    this.dateFilter = 'all';
    this.customDateFrom = null;
    this.customDateTo = null;
    this.applyFilters();
  }

  getUniqueTeachers(): string[] {
    const teachers = this.completedMeetings.map(m => m.teacher.name);
    return [...new Set(teachers)].sort();
  }

  getUniqueBatches(): string[] {
    const batches = this.completedMeetings.map(m => m.batch);
    return [...new Set(batches)].sort();
  }

  viewMeetingDetails(meetingId: string): void {
    this.router.navigate(['/teacher/meetings', meetingId]);
  }

  viewAttendance(meetingId: string): void {
    this.router.navigate(['/teacher/meetings', meetingId, 'attendance']);
  }

  viewEngagement(meetingId: string): void {
    this.router.navigate(['/teacher/meetings', meetingId, 'engagement']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  }

  getAttendanceColor(rate: number): string {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'danger';
  }

  deleteMeeting(meetingId: string, topic: string): void {
    if (!confirm(`Are you sure you want to delete "${topic}"? This cannot be undone.`)) {
      return;
    }
    this.zoomService.deleteMeeting(meetingId).subscribe({
      next: () => {
        this.allMeetings = this.allMeetings.filter(m => m._id !== meetingId);
        this.completedMeetings = this.completedMeetings.filter(m => m._id !== meetingId);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error deleting meeting:', err);
        alert('Failed to delete class. Please try again.');
      }
    });
  }

  exportToCSV(): void {
    if (this.filteredMeetings.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Topic',
      'Teacher',
      'Batch',
      'Duration (min)',
      'Total Students',
      'Attended',
      'Absent',
      'Attendance Rate (%)'
    ];

    const rows = this.filteredMeetings.map(meeting => [
      this.formatDate(meeting.startTime),
      meeting.topic,
      meeting.teacher.name,
      meeting.batch,
      meeting.duration,
      meeting.attendees,
      meeting.attended,
      meeting.absent,
      meeting.attendanceRate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zoom_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  exportTeacherReport(): void {
    if (this.completedMeetings.length === 0) {
      alert('No data to export');
      return;
    }

    // Group by teacher
    const teacherStats: any = {};
    
    this.completedMeetings.forEach(meeting => {
      const teacherName = meeting.teacher.name;
      
      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = {
          name: teacherName,
          email: meeting.teacher.email,
          totalMeetings: 0,
          totalDuration: 0,
          totalStudents: 0,
          totalAttended: 0,
          avgAttendance: 0
        };
      }
      
      teacherStats[teacherName].totalMeetings++;
      teacherStats[teacherName].totalDuration += meeting.duration;
      teacherStats[teacherName].totalStudents += meeting.attendees;
      teacherStats[teacherName].totalAttended += meeting.attended;
    });

    // Calculate averages
    Object.values(teacherStats).forEach((stats: any) => {
      stats.avgAttendance = stats.totalStudents > 0 
        ? Math.round((stats.totalAttended / stats.totalStudents) * 100)
        : 0;
    });

    const headers = [
      'Teacher Name',
      'Email',
      'Total Meetings',
      'Total Duration (min)',
      'Total Students',
      'Total Attended',
      'Avg Attendance Rate (%)'
    ];

    const rows = Object.values(teacherStats).map((stats: any) => [
      stats.name,
      stats.email,
      stats.totalMeetings,
      stats.totalDuration,
      stats.totalStudents,
      stats.totalAttended,
      stats.avgAttendance
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `teacher_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }
}
