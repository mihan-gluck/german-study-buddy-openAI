// src/app/services/feedback.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Define a feedback model interface for strong typing
export interface Feedback {
  feedback: string;
  rating: number;
  studentId?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly BASE_URL = `${environment.apiUrl}/feedback`;
  private readonly TEACHER_URL = `${environment.apiUrl}/teacher`;

  constructor(private http: HttpClient) {}

  /**
   * Submit a feedback (used by students)
   */
  submitFeedback(feedback: Feedback): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, feedback, { withCredentials: true });
  }

  /**
   * Get feedback by student ID
   */
  getFeedbackByStudentId(studentId: string): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.BASE_URL}/student/${studentId}`, { withCredentials: true });
  }

  /**
   * Get all students (for teacher views, if needed)
   */
  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.TEACHER_URL}/students`, { withCredentials: true });
  }

  getAllFeedback(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}`, { withCredentials: true });
  }
}
